const fs = require('fs');
const backup = fs.readFileSync('resources/js/components/VideoEditorModal.backup.tsx', 'utf8');

// Extract processVideoNative from backup
const startIdx = backup.indexOf('  const processVideoNative = async');
const endIdx = backup.indexOf('  // Motor Ultra-Rápido');
let nativeFunc = backup.substring(startIdx, endIdx);

// Modify processVideoNative to work with new state
nativeFunc = nativeFunc.replace(/previewVideoRef\.current\?\.src = newUrl;/g, '');
nativeFunc = nativeFunc.replace(/previewVideoRef\.current\?\.load\(\);/g, '');
nativeFunc = nativeFunc.replace(/previewVideoRef\.current\?\.play\(\)\.catch\(\(\) => \{\}\);/g, '');
nativeFunc = nativeFunc.replace(/if \(previewVideoRef\.current\) \{/g, '');
nativeFunc = nativeFunc.replace(/releasePreviewMemory\(\);/g, '');
nativeFunc = nativeFunc.replace(/trimmedUrlRef\.current = newUrl;/g, '');
nativeFunc = nativeFunc.replace(/const totalDur = tempVideo\.duration \|\| \(duration > 0 \? duration : 5\);/g, 'const totalDur = tempVideo.duration || (durationInSeconds > 0 ? durationInSeconds : 5);');

let current = fs.readFileSync('resources/js/components/VideoEditorModal.tsx', 'utf8');

// Insert processVideoNative
current = current.replace('  const processVideoWithFFmpeg = async (', nativeFunc + '  const processVideoWithFFmpeg = async (');

// Update processVideoWithFFmpeg catch block
current = current.replace(
  "console.warn('FFmpeg WASM processing failed:', error);\n      return null;",
  "console.warn('FFmpeg WASM processing failed, using native canvas fallback:', error);\n      return await processVideoNative(targetMode, targetSpeed, targetMuted);"
);

fs.writeFileSync('resources/js/components/VideoEditorModal.tsx', current);
console.log('Fallback added successfully');
