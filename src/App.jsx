import { useState } from 'react'
import IPhoneFrame from './components/IPhoneFrame'
import HomeScreen from './components/HomeScreen'
import AddSegmentsScreen from './components/AddSegmentsScreen'
import PixelDensityScreen from './components/PixelDensityScreen'

function App() {
  const [screen, setScreen] = useState('home')
  const [uploadedImage, setUploadedImage] = useState(null)
  const [segments, setSegments] = useState([])
  const [history, setHistory] = useState([])
  const [generating, setGenerating] = useState(null)

  const handleUpload = (image) => {
    setUploadedImage(image)
    setScreen('addSegments')
  }

  const handleAddSegments = (newSegments) => {
    setSegments(newSegments)
    setScreen('pixelDensity')
  }

  const handleGenerate = () => {
    setGenerating({
      name: 'Generating...',
      date: '01 Dec 2025',
      address: '#170, Calgary, Alberta T2C5T4',
      image: null
    })
    setScreen('home')
    
    setTimeout(() => {
      setHistory(prev => [{
        id: Date.now(),
        name: 'Generated House',
        date: '01 Dec 2025',
        address: '#170, Calgary, Alberta T2C5T4',
        image: uploadedImage
      }, ...prev])
      setGenerating(null)
      setUploadedImage(null)
      setSegments([])
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
      <IPhoneFrame>
        {screen === 'home' && (
          <HomeScreen 
            onUpload={handleUpload}
            history={history}
            generating={generating}
            onNewProject={() => setScreen('home')}
          />
        )}
        {screen === 'addSegments' && (
          <AddSegmentsScreen
            image={uploadedImage}
            segments={segments}
            onBack={() => setScreen('home')}
            onNext={handleAddSegments}
          />
        )}
        {screen === 'pixelDensity' && (
          <PixelDensityScreen
            image={uploadedImage}
            segments={segments}
            onBack={() => setScreen('addSegments')}
            onGenerate={handleGenerate}
          />
        )}
      </IPhoneFrame>
    </div>
  )
}

export default App
