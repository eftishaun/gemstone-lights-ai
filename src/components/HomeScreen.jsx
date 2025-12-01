import { useState } from 'react'
import { ArrowLeft, Plus, Sparkles, ChevronRight, Download, X } from 'lucide-react'

export default function HomeScreen({ onUpload, history, generating, onNewProject }) {
  const [selectedImage, setSelectedImage] = useState(null)

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        onUpload(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDownload = (item, e) => {
    e.stopPropagation()
    const link = document.createElement('a')
    link.href = item.image
    link.download = `${item.name}-${item.date}.jpg`
    link.click()
  }

  const hasContent = generating || history.length > 0

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-[#237BC0] text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" />
          <h1 className="text-lg font-medium">Gemstone Lights AI</h1>
        </div>
        {hasContent && (
          <label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Plus className="w-5 h-5 cursor-pointer" />
          </label>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {!hasContent ? (
          <div className="flex flex-col items-center justify-center h-full px-8">
            <div className="w-16 h-16 bg-[#237BC0] rounded-full flex items-center justify-center mb-5">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2 text-center">
              Generate Your First House
            </h2>
            <p className="text-gray-500 text-center text-sm leading-relaxed">
              Please upload a photo of a house and draw lines on the area you would like to add the lights.
            </p>
          </div>
        ) : (
          <div className="p-4">
            {generating && (
              <div className="bg-white rounded-lg p-3 mb-4 flex gap-3">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-[#237BC0] border-t-transparent rounded-full animate-spin" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-0.5 text-sm">{generating.name}</h3>
                  <p className="text-xs text-gray-500 mb-0.5">{generating.date}</p>
                  <p className="text-xs text-gray-500">{generating.address}</p>
                </div>
              </div>
            )}

            {history.length > 0 && (
              <>
                <h2 className="text-base font-bold text-gray-900 mb-3">History</h2>
                <div className="space-y-2">
                  {history.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-white rounded-lg p-3 flex gap-3 items-center cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedImage(item)}
                    >
                      <div className="w-16 h-16 bg-gray-300 rounded-lg flex-shrink-0">
                        {item.image && (
                          <img src={item.image} alt="" className="w-full h-full object-cover rounded-lg" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-0.5 truncate text-sm">{item.name}</h3>
                        <p className="text-xs text-gray-500 mb-0.5">{item.date}</p>
                        <p className="text-xs text-gray-500 truncate">{item.address}</p>
                      </div>
                      <button
                        onClick={(e) => handleDownload(item, e)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <Download className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="absolute bottom-5 left-4 right-4">
        <label className="block">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="bg-[#237BC0] text-white py-3 rounded-lg text-center text-sm font-medium cursor-pointer hover:bg-[#236a9f] transition-colors">
            Upload a Photo
          </div>
        </label>
      </div>

      {/* Full Screen Image Modal */}
      {selectedImage && (
        <div className="absolute inset-0 bg-black z-50 flex flex-col">
          <div className="bg-[#237BC0] text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => setSelectedImage(null)}>
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-medium">{selectedImage.name}</h1>
            </div>
            <button onClick={(e) => handleDownload(selectedImage, e)}>
              <Download className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <img 
              src={selectedImage.image} 
              alt={selectedImage.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}
