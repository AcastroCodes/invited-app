const fs = require('fs');
const backup = fs.readFileSync('resources/js/components/VideoEditorModal.backup.tsx', 'utf8');
const current = fs.readFileSync('resources/js/components/VideoEditorModal.tsx', 'utf8');

const startState = backup.indexOf('  const loadedInputSrcRef');
const endState = backup.indexOf('  const handleSelectMode');
const ffmpegLogic = backup.substring(startState, endState);

const insertPoint = current.indexOf('  const fps = 30;');

let newCurrent = current.replace(
  `import type { CanvasElement } from '../types/designerTypes';`,
  `import type { CanvasElement } from '../types/designerTypes';\nimport { FFmpeg } from '@ffmpeg/ffmpeg';\nimport { fetchFile, toBlobURL } from '@ffmpeg/util';`
);

newCurrent = newCurrent.slice(0, insertPoint) + ffmpegLogic + '\n' + newCurrent.slice(insertPoint);

newCurrent = newCurrent.replace(
  'const [activeTab, setActiveTab]', 
  'const [trimmedVideoUrl, setTrimmedVideoUrl] = useState<string | null>(null);\n  const [processingProgress, setProcessingProgress] = useState(0);\n  const ffmpegRef = useRef(new FFmpeg());\n  const [activeTab, setActiveTab]'
);

newCurrent = newCurrent.replace(
  `src: element.content || '',`,
  `src: trimmedVideoUrl || element.content || '',`
);

// We need to add the button below the MODES grid.
const searchStr = `</button>
                        );
                      })}
                    </div>`;
const uiInsertPoint = newCurrent.indexOf(searchStr);
if (uiInsertPoint !== -1) {
    const buttonUI = `</button>
                        );
                      })}
                    </div>
                    
                    <button 
                      onClick={() => processVideoWithFFmpeg(loopMode, speed, isMuted)}
                      disabled={isProcessing}
                      className="mt-3 w-full py-2 flex items-center justify-center gap-2 rounded-md text-xs font-medium transition-colors border"
                      style={{ 
                        backgroundColor: 'var(--bg-app)',
                        borderColor: 'var(--primary-accent)',
                        color: 'var(--primary-accent)'
                      }}
                    >
                      {isProcessing && processingProgress < 100 ? (
                        <><Loader2 className="w-3 h-3 animate-spin" /> Procesando {processingProgress}%</>
                      ) : (
                        <><Zap className="w-3 h-3" /> Aplicar Bucle y Velocidad</>
                      )}
                    </button>`;
    newCurrent = newCurrent.replace(searchStr, buttonUI);
} else {
    console.log('UI insert point not found');
}

newCurrent = newCurrent.replace(
  'await onSave({',
  'await onSave({\n      content: trimmedVideoUrl || element.content,'
);

fs.writeFileSync('resources/js/components/VideoEditorModal.tsx', newCurrent);
console.log('Done');
