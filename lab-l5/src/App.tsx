import React, { useState } from 'react'
import { Container, Typography, Tabs, Tab, Grid } from '@mui/material'
import { ToastContainer } from 'react-toastify'
import useAsyncEffect from 'use-async-effect'
import checkForMetaNetClient from './utils/checkForMetaNetClient'
import { NoMncModal } from 'metanet-react-prompt'
import DownloadForm from './components/DownloadForm'
import UploadForm from './components/UploadForm'
import Footer from './components/Footer'
import { Img } from 'uhrp-react' // Import the Img component from uhrp-react

const App: React.FC = () => {
  const [tabIndex, setTabIndex] = useState<number>(0)
  const [isMncMissing, setIsMncMissing] = useState<boolean>(false)
  const [downloadedImageURL, setDownloadedImageURL] = useState<string>('') // Store the downloaded image URL

  // Run a 1s interval for checking if MNC is running
  useAsyncEffect(async () => {
    const intervalId = setInterval(async () => {
      const hasMNC = await checkForMetaNetClient()
      if (hasMNC === 0) {
        setIsMncMissing(true) // Open modal if MNC is not found
      } else {
        setIsMncMissing(false) // Ensure modal is closed if MNC is found
      }
    }, 1000)

    return () => {
      clearInterval(intervalId)
    }
  }, [])

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabIndex(newValue)
  }

  const handleDownloadSuccess = (url: string) => {
    setDownloadedImageURL(url) // Set the downloaded image URL for display
  }

  return (
    <Container maxWidth="sm" sx={{ paddingTop: '2em' }}>
      <NoMncModal open={isMncMissing} onClose={() => setIsMncMissing(false)} />
      <Grid container spacing={2}>
        <ToastContainer />
        <Grid item xs={12}>
          <Typography variant="h4" align="center">
            NanoStore UI
          </Typography>
          <Typography color="textSecondary" paragraph align="center">
            Upload and Download Content
          </Typography>
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Download" />
            <Tab label="Upload" />
            <Tab label="Renew (coming soon)" disabled />
          </Tabs>
        </Grid>

        {/* Conditional rendering of the forms */}
        <Grid item xs={12}>
          {tabIndex === 0 && <DownloadForm onDownloadSuccess={handleDownloadSuccess} />}
          {tabIndex === 1 && <UploadForm />}
        </Grid>

        {/* Display the downloaded image using the Img component */}
        {downloadedImageURL && (
          <Grid item xs={12}>
            <Typography variant="h6" align="center">
              Downloaded Image:
            </Typography>
            <Img src={downloadedImageURL} alt="Downloaded file" width="100%" />
          </Grid>
        )}

        <Grid item xs={12}>
          <Footer />
        </Grid>
      </Grid>
    </Container>
  )
}

export default App
