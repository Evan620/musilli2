import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Image, Zap, CheckCircle } from 'lucide-react';
import { formatFileSize } from '@/utils/imageCompression';

interface CompressionStats {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

interface ImageCompressionProgressProps {
  isCompressing: boolean;
  progress: number;
  currentFile: string;
  stats?: CompressionStats;
  totalFiles: number;
  completedFiles: number;
}

export const ImageCompressionProgress: React.FC<ImageCompressionProgressProps> = ({
  isCompressing,
  progress,
  currentFile,
  stats,
  totalFiles,
  completedFiles
}) => {
  if (!isCompressing && !stats) return null;

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center gap-2">
            <div className="p-1 bg-blue-100 rounded">
              {isCompressing ? (
                <Zap className="w-4 h-4 text-blue-600 animate-pulse" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-600" />
              )}
            </div>
            <div>
              <h4 className="font-medium text-blue-900">
                {isCompressing ? 'Compressing Images...' : 'Compression Complete!'}
              </h4>
              <p className="text-sm text-blue-700">
                {isCompressing 
                  ? `Processing ${completedFiles + 1} of ${totalFiles} images`
                  : `${totalFiles} image${totalFiles > 1 ? 's' : ''} optimized`
                }
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          {isCompressing && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex items-center justify-between text-sm text-blue-700">
                <span className="flex items-center gap-1">
                  <Image className="w-3 h-3" />
                  {currentFile}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>
          )}

          {/* Compression Stats */}
          {stats && (
            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-blue-200">
              <div className="text-center">
                <p className="text-xs text-blue-600">Original Size</p>
                <p className="font-medium text-blue-900">
                  {formatFileSize(stats.originalSize)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-blue-600">Compressed Size</p>
                <p className="font-medium text-blue-900">
                  {formatFileSize(stats.compressedSize)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-blue-600">Space Saved</p>
                <p className="font-medium text-green-600">
                  {Math.round(stats.compressionRatio)}%
                </p>
              </div>
            </div>
          )}

          {/* Benefits Message */}
          {!isCompressing && stats && (
            <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
              ✨ Images optimized for faster loading while maintaining quality
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
