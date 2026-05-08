import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { FolderTree, Download, FileText, Folder } from 'lucide-react';

const App = () => {
  const [input, setInput] = useState('');
  const [structure, setStructure] = useState([]);

  // Helper to parse the text into a flat array of objects with depth
  const parseStructure = (text) => {
    const lines = text.split('\n');
    const result = [];
    
    lines.forEach((line) => {
      if (!line.trim()) return;

      // Clean the line and calculate depth based on leading spaces
      const name = line.replace(/[│├└─]/g, '').trim();
      const depth = line.search(/\S/); // Index of first non-whitespace character

      result.push({ name, depth, isFile: name.includes('.') });
    });
    return result;
  };

  useEffect(() => {
    setStructure(parseStructure(input));
  }, [input]);

  const downloadZip = async () => {
    const zip = new JSZip();
    const folderRefs = { [-1]: zip };
    
    // We track the last folder at each depth level to handle nesting
    const lastAtDepth = { [-1]: zip };

    structure.forEach((item) => {
      // Find the closest parent by looking at previous depths
      const parentDepth = Object.keys(lastAtDepth)
        .map(Number)
        .filter(d => d < item.depth)
        .sort((a, b) => b - a)[0];

      const currentParent = lastAtDepth[parentDepth];

      if (item.isFile) {
        currentParent.file(item.name, `// Created by Scaffold tool\n`);
      } else {
        const newFolder = currentParent.folder(item.name);
        lastAtDepth[item.depth] = newFolder;
      }
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = "scaffolded_project.zip";
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans">
      <header className="max-w-6xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FolderTree className="text-blue-400" /> Sapling
          </h1>
          <p className="text-slate-400">Turn AI tree structures into project folders instantly.</p>
        </div>
        <button 
          onClick={downloadZip}
          disabled={!structure.length}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all"
        >
          <Download size={20} /> Download .zip
        </button>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Area */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">Paste Structure Here</label>
          <textarea
            className="h-[500px] w-full bg-slate-800 border border-slate-700 rounded-xl p-4 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder={`src/\n  components/\n    Header.js\n  utils/\nindex.html`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        {/* Preview Area */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">Live Preview</label>
          <div className="h-[500px] w-full bg-slate-950 border border-slate-800 rounded-xl p-6 overflow-y-auto">
            {structure.length === 0 ? (
              <div className="text-slate-600 italic">Preview will appear here...</div>
            ) : (
              structure.map((item, idx) => (
                <div 
                  key={idx} 
                  style={{ paddingLeft: `${(item.depth / 2) * 1.5}rem` }}
                  className="flex items-center gap-2 py-1 border-l border-slate-800 ml-2"
                >
                  {item.isFile ? <FileText size={16} className="text-slate-400" /> : <Folder size={16} className="text-blue-400" />}
                  <span className={item.isFile ? "text-slate-300" : "text-blue-100 font-medium"}>
                    {item.name}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;