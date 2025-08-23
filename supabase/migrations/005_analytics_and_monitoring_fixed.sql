-- Real-time Analytics & Monitoring Migration (FIXED VERSION)
-- This migration adds analytics tracking and real-time monitoring capabilities

-- 1. Create platform analytics table for metrics tracking
CREATE TABLE IF NOT EXISTS platform_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  metric_type VARCHAR(50) NOT NULL, -- 'daily_active_users', 'property_views', 'user_registrations', etc.
  metric_value INTEGER NOT NULL,
  additional_data JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(date, metric_type)
);

-- 2. Create property analytics table
CREATE TABLE IF NOT EXISTS property_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  inquiries INTEGER DEFAULT 0,
  favorites INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(property_id, date)
);

-- 3. Create user activity tracking table
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- 'login', 'property_view', 'search', 'inquiry', etc.
  entity_type VARCHAR(50), -- 'property', 'provider', 'search'
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create revenue tracking table
CREATE TABLE IF NOT EXISTS revenue_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES profiles(id),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'KSH',
  transaction_type VARCHAR(50) NOT NULL, -- 'subscription', 'commission', 'listing_fee'
  description TEXT,
  payment_method VARCHAR(50),
  payment_reference VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Create real-time dashboard stats view (FIXED - no 'deleted' status)
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
  -- User metrics (exclude soft-deleted users)
  (SELECT COUNT(*) FROM profiles WHERE deleted_at IS NULL) as total_users,
  (SELECT COUNT(*) FROM profiles WHERE status = 'approved' AND deleted_at IS NULL) as active_users,
  (SELECT COUNT(*) FROM profiles WHERE status = 'suspended' AND deleted_at IS NULL) as suspended_users,
  (SELECT COUNT(*) FROM profiles WHERE created_at >= CURRENT_DATE - INTERVAL '30 days' AND deleted_at IS NULL) as new_users_30_days,
  
  -- Provider metrics (exclude soft-deleted providers)
  (SELECT COUNT(*) FROM profiles WHERE role = 'provider' AND deleted_at IS NULL) as total_providers,
  (SELECT COUNT(*) FROM profiles WHERE role = 'provider' AND status = 'pending' AND deleted_at IS NULL) as pending_providers,
  (SELECT COUNT(*) FROM profiles WHERE role = 'provider' AND status = 'approved' AND deleted_at IS NULL) as active_providers,
  
  -- Property metrics
  (SELECT COUNT(*) FROM properties) as total_properties,
  (SELECT COUNT(*) FROM properties WHERE status = 'pending') as pending_properties,
  (SELECT COUNT(*) FROM properties WHERE status = 'approved') as active_properties,
  (SELECT COUNT(*) FROM properties WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_properties_30_days,
  
  -- Activity metrics
  (SELECT COUNT(*) FROM user_activity WHERE created_at >= CURRENT_DATE) as daily_activities,
  (SELECT COUNT(*) FROM user_activity WHERE activity_type = 'login' AND created_at >= CURRENT_DATE) as daily_logins,
  
  -- Revenue metrics
  (SELECT COALESCE(SUM(amount), 0) FROM revenue_records WHERE status = 'completed') as total_revenue,
  (SELECT COALESCE(SUM(amount), 0) FROM revenue_records WHERE status = 'completed' AND created_at >= CURRENT_DATE - INTERVAL '30 days') as revenue_30_days;

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_platform_analytics_date_type ON platform_analytics(date, metric_type);
CREATE INDEX IF NOT EXISTS idx_property_analytics_property_date ON property_analytics(property_id, date);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_date ON user_activity(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_type_date ON user_activity(activity_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_provider_date ON revenue_records(provider_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_status_date ON revenue_records(status, created_at DESC);

-- 7. Create functions for analytics tracking

-- Function to track user activity
CREATE OR REPLACE FUNCTION track_user_activity(
  p_user_id UUID,
  p_activity_type VARCHAR(50),
  p_entity_type VARCHAR(50) DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO user_activity (
    user_id, activity_type, entity_type, entity_id, 
    metadata, ip_address, user_agent
  ) VALUES (
    p_user_id, p_activity_type, p_entity_type, p_entity_id,
    p_metadata, p_ip_address, p_user_agent
  ) RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update property analytics
CREATE OR REPLACE FUNCTION update_property_analytics(
  p_property_id UUID,
  p_metric_type VARCHAR(20), -- 'view', 'inquiry', 'favorite', 'share'
  p_increment INTEGER DEFAULT 1
) RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO property_analytics (property_id, date, views, inquiries, favorites, shares)
  VALUES (
    p_property_id, 
    CURRENT_DATE,
    CASE WHEN p_metric_type = 'view' THEN p_increment ELSE 0 END,
    CASE WHEN p_metric_type = 'inquiry' THEN p_increment ELSE 0 END,
    CASE WHEN p_metric_type = 'favorite' THEN p_increment ELSE 0 END,
    CASE WHEN p_metric_type = 'share' THEN p_increment ELSE 0 END
  )
  ON CONFLICT (property_id, date) DO UPDATE SET
    views = property_analytics.views + CASE WHEN p_metric_type = 'view' THEN p_increment ELSE 0 END,
    inquiries = property_analytics.inquiries + CASE WHEN p_metric_type = 'inquiry' THEN p_increment ELSE 0 END,
    favorites = property_analytics.favorites + CASE WHEN p_metric_type = 'favorite' THEN p_increment ELSE 0 END,
    shares = property_analytics.shares + CASE WHEN p_metric_type = 'share' THEN p_increment ELSE 0 END;
    
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record platform metrics
CREATE OR REPLACE FUNCTION record_platform_metric(
  p_metric_type VARCHAR(50),
  p_metric_value INTEGER,
  p_date DATE DEFAULT CURRENT_DATE,
  p_additional_data JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  metric_id UUID;
BEGIN
  INSERT INTO platform_analytics (date, metric_type, metric_value, additional_data)
  VALUES (p_date, p_metric_type, p_metric_value, p_additional_data)
  ON CONFLICT (date, metric_type) DO UPDATE SET
    metric_value = p_metric_value,
    additional_data = p_additional_data
  RETURNING id INTO metric_id;
  
  RETURN metric_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get dashboard analytics (FIXED - exclude soft-deleted users)
CREATE OR REPLACE FUNCTION get_dashboard_analytics(
  p_days INTEGER DEFAULT 30
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'overview', (SELECT row_to_json(dashboard_stats.*) FROM dashboard_stats),
    'user_growth', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'date', date,
          'new_users', COUNT(*)
        ) ORDER BY date
      )
      FROM (
        SELECT DATE(created_at) as date
        FROM profiles 
        WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * p_days
        AND deleted_at IS NULL
        GROUP BY DATE(created_at)
      ) daily_users
    ),
    'property_performance', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'date', date,
          'total_views', COALESCE(SUM(views), 0),
          'total_inquiries', COALESCE(SUM(inquiries), 0)
        ) ORDER BY date
      )
      FROM property_analytics
      WHERE date >= CURRENT_DATE - INTERVAL '1 day' * p_days
      GROUP BY date
    ),
    'activity_trends', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'date', DATE(created_at),
          'activity_count', COUNT(*)
        ) ORDER BY DATE(created_at)
      )
      FROM user_activity
      WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * p_days
      GROUP BY DATE(created_at)
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Grant permissions
GRANT SELECT, INSERT, UPDATE ON platform_analytics TO authenticated;
GRANT SELECT, INSERT, UPDATE ON property_analytics TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_activity TO authenticated;
GRANT SELECT, INSERT, UPDATE ON revenue_records TO authenticated;
GRANT SELECT ON dashboard_stats TO authenticated;

GRANT EXECUTE ON FUNCTION track_user_activity TO authenticated;
GRANT EXECUTE ON FUNCTION update_property_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION record_platform_metric TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_analytics TO authenticated;

-- 9. Enable RLS
ALTER TABLE platform_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analytics tables (admin access only)
CREATE POLICY "Admins can access platform analytics" ON platform_analytics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can access property analytics" ON property_analytics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can access their own activity" ON user_activity
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can access all activity" ON user_activity
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Providers can access their revenue" ON revenue_records
  FOR SELECT USING (provider_id = auth.uid());

CREATE POLICY "Admins can access all revenue" ON revenue_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 10. Insert initial analytics data
INSERT INTO system_notifications (type, title, message, severity)
VALUES (
  'system_update',
  'Analytics System Enabled',
  'Real-time analytics and monitoring system has been successfully deployed. Dashboard now shows live metrics and activity tracking.',
  'success'
);

-- 11. Create sample analytics data for testing
DO $$
BEGIN
  -- Insert sample platform metrics for the last 7 days
  FOR i IN 0..6 LOOP
    PERFORM record_platform_metric(
      'daily_active_users',
      50 + (RANDOM() * 20)::INTEGER,
      (CURRENT_DATE - INTERVAL '1 day' * i)::DATE
    );

    PERFORM record_platform_metric(
      'user_registrations',
      3 + (RANDOM() * 5)::INTEGER,
      (CURRENT_DATE - INTERVAL '1 day' * i)::DATE
    );

    PERFORM record_platform_metric(
      'property_views',
      200 + (RANDOM() * 100)::INTEGER,
      (CURRENT_DATE - INTERVAL '1 day' * i)::DATE
    );
  END LOOP;
END $$;

COMMENT ON TABLE platform_analytics IS 'Stores daily platform metrics and KPIs';
COMMENT ON TABLE property_analytics IS 'Tracks property-specific performance metrics';
COMMENT ON TABLE user_activity IS 'Records all user activities for analytics and audit';
COMMENT ON TABLE revenue_records IS 'Tracks all revenue transactions and payments';
COMMENT ON VIEW dashboard_stats IS 'Real-time dashboard statistics view';
COMMENT ON FUNCTION get_dashboard_analytics IS 'Returns comprehensive analytics data for dashboard';
