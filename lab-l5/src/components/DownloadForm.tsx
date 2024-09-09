import React, { FormEvent, useState, useEffect } from 'react'
import {
  Button,
  LinearProgress,
  Grid,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import { CloudDownload } from '@mui/icons-material'
import { toast } from 'react-toastify'
import { download } from 'nanoseek'
import constants from '../utils/constants'
import { SelectChangeEvent } from '@mui/material'

// Add onDownloadSuccess prop to handle the downloaded image
interface DownloadFormProps {
  onDownloadSuccess: (url: string) => void; // Pass URL to parent
}

const DownloadForm: React.FC<DownloadFormProps> = ({ onDownloadSuccess }) => {
  const [overlayServiceURL, setOverlayServiceURL] = useState<string>('')
  const [overlayServiceURLs, setOverlayServiceURLs] = useState<string[]>(constants.confederacyURLs.map(x => x.toString()))
  const [downloadURL, setDownloadURL] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [inputsValid, setInputsValid] = useState<boolean>(false)
  const [openDialog, setOpenDialog] = useState<boolean>(false)
  const [newOption, setNewOption] = useState<string>('')

  useEffect(() => {
    setInputsValid(overlayServiceURL.trim() !== '' && downloadURL.trim() !== '')
  }, [overlayServiceURL, downloadURL])

  useEffect(() => {
    if (constants.confederacyURLs && constants.confederacyURLs.length > 0) {
      setOverlayServiceURL(constants.confederacyURLs[0].toString())
    }
  }, [])

  const handleDownload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Use the nanoseek download function to download the file from an Overlay Service.
      const { mimeType, data } = await download({
        UHRPUrl: downloadURL.trim() || '', // The UHRP URL from the user input
        confederacyHost: overlayServiceURL.trim(), // The overlay service URL from the user input
      });

      const blob = new Blob([data], { type: mimeType })
      const url = URL.createObjectURL(blob)

      // Trigger success callback to display the image
      onDownloadSuccess(url)

    } catch (error) {
      toast.error('An error occurred during download')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const selectedValue = event.target.value
    if (selectedValue === 'add-new-option') {
      setOpenDialog(true)
    } else {
      setOverlayServiceURL(selectedValue)
    }
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const handleAddOption = () => {
    if (newOption.trim() !== '' && !constants.confederacyURLs.includes(newOption)) {
      setOverlayServiceURLs(prevConfederacyURLs => [...prevConfederacyURLs, newOption])
      setOverlayServiceURL(newOption)
      setNewOption('')
      setOpenDialog(false)
    }
  }

  return (
    <form onSubmit={handleDownload}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant='h4'>Download Form</Typography>
          <Typography color='textSecondary' paragraph>
            Download files from NanoStore
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth variant='outlined'>
            <InputLabel>Overlay Service URL</InputLabel>
            <Select
              value={overlayServiceURL}
              onChange={handleSelectChange}
              label='Overlay Service URL'
            >
              {overlayServiceURLs.map((url, index) => (
                <MenuItem key={index} value={url.toString()}>
                  {url.toString()}
                </MenuItem>
              ))}
              <MenuItem value='add-new-option'>+ Add New Option</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            variant='outlined'
            label='UHRP URL'
            value={downloadURL}
            onChange={(e) => setDownloadURL(e.target.value)}
          />
          <Grid />

          {/* Dialog for adding a new option */}
          <Dialog open={openDialog} onClose={handleCloseDialog}>
            <DialogTitle>Add a New Confederacy Resolver URL</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin='dense'
                label='URL'
                type='text'
                fullWidth
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={handleAddOption}>Add</Button>
            </DialogActions>
          </Dialog>
        </Grid>
        <Grid item>
          <Button
            variant='contained'
            color='primary'
            size='large'
            type='submit'
            disabled={loading || !inputsValid}
            startIcon={<CloudDownload />}
          >
            Download
          </Button>
          {loading && (
            <Grid item xs={12}>
              <LinearProgress />
            </Grid>
          )}
        </Grid>
      </Grid>
    </form>
  )
}

export default DownloadForm
