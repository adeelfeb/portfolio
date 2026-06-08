'use client'

import PortfolioImage from './PortfolioImage'

export default function BrowserMockup({ src, alt, title, className = '' }) {
  return (
    <div className={`rounded-xl overflow-hidden border border-gray-200/80 bg-gray-100 shadow-lg ${className}`}>
      <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-200/90 border-b border-gray-300/60">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400/90" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400/90" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/90" />
        <div className="flex-1 mx-2 h-5 rounded-md bg-white/70 border border-gray-300/50 flex items-center px-2">
          <span className="text-[10px] text-gray-500 truncate">{title || 'designndev.com'}</span>
        </div>
      </div>
      <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
        {src ? (
          <PortfolioImage src={src} alt={alt} fill className="object-cover object-top" />
        ) : (
          <CodeEditorFallback />
        )}
      </div>
    </div>
  )
}

function CodeEditorFallback() {
  return (
    <div className="absolute inset-0 p-4 font-mono text-xs leading-relaxed">
      <div className="flex gap-3 h-full">
        <div className="w-12 shrink-0 space-y-2 opacity-40">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-1 bg-gray-600 rounded w-full" />
          ))}
        </div>
        <div className="flex-1 space-y-2">
          <p><span className="text-purple-400">export</span> <span className="text-blue-300">default</span> <span className="text-amber-200">function</span> <span className="text-emerald-300">App</span>() {'{'}</p>
          <p className="pl-4"><span className="text-purple-400">return</span> (</p>
          <p className="pl-8 text-gray-400">&lt;<span className="text-blue-300">main</span> className=<span className="text-amber-200">&quot;app&quot;</span>&gt;</p>
          <p className="pl-12 text-gray-500">{'// your project, built right'}</p>
          <p className="pl-8 text-gray-400">&lt;/<span className="text-blue-300">main</span>&gt;</p>
          <p className="pl-4">)</p>
          <p>{'}'}</p>
        </div>
      </div>
    </div>
  )
}
