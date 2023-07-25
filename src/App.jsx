import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { ArrowUpward, ArrowDownward } from '@mui/icons-material'
import { CircularProgress, Dialog, DialogContent, DialogContentText, DialogTitle, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, TextField, Checkbox, Button, Backdrop, Box } from '@mui/material'
import './App.css'

export default function App() {
  const [data, setData] = useState([])
  const [nextData, setNextData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(100)
  const [columns, setColumns] = useState({
    id: true,
    first_name: true,
    last_name: true,
    email: true,
  })
  const [filter, setFilter] = useState("")
  const [open, setOpen] = useState(false)
  const [dialogContent, setDialogContent] = useState({})
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' })

  const handleColumnToggle = (columnName) => {
    setColumns((prev) => ({
      ...prev,
      [columnName]: !prev[columnName],
    }))
  }

  const sortData = (a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1
    }
    return 0
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const response = await axios.get(`https://random-data-api.com/api/users/random_user?size=100`)
      setData(response.data.sort(sortData))
      setLoading(false)
    }

    fetchData()
  }, [])

  useEffect(() => {
    setData((prevData) =>
      [...prevData].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
      })
    )
  }, [sortConfig])

  useEffect(() => {
    const fetchNextData = async () => {
      setLoading(true)
      const response = await axios.get(`https://random-data-api.com/api/users/random_user?size=100`)
      setNextData(response.data.sort(sortData))
      setLoading(false)
    }

    if (nextData === null && page < 20) fetchNextData()
  }, [nextData, page])

  const handleChangePage = (event, newPage) => {
    event.preventDefault()
    setData(nextData)
    setNextData(null)
    setPage(newPage)
  }

  const handleFilterChange = (event) => setFilter(event.target.value)

  const handleClickOpen = (content) => {
    setOpen(true)
    setDialogContent(content)
  }

  const handleClose = () => setOpen(false)

  const handleSort = (columnName) => {
    setSortConfig((prevSortConfig) => {
      if (prevSortConfig.key === columnName) {
        return {
          ...prevSortConfig,
          direction: prevSortConfig.direction === "ascending" ? "descending" : "ascending",
        }
      }
      return { key: columnName, direction: "ascending" }
    })
  }

  if (loading) return <Backdrop open={loading} style={{zIndex: 1500, color: '#fff'}}>
    <CircularProgress color="inherit" />
  </Backdrop>

  return <div className="App">
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={4}>
        <TextField label="Filter" value={filter} onChange={handleFilterChange} />
      </Grid>
      {Object.keys(columns).map((columnName, index) => (
        <Grid item xs={6} sm={3} md={2} key={index}>
          <Box
              sx={{ 
              color: '#010101',
              display: 'flex', 
              alignItems: 'center'
            }}
          >
          <Checkbox
            checked={columns[columnName]}
            onChange={() => handleColumnToggle(columnName)}
          />
            {columnName}
          </Box>
        </Grid>
      ))}
      <Grid item xs={12}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {Object.keys(columns).map((columnName, index) =>
                  columns[columnName] && (
                    <TableCell
                      sx={{ cursor: 'pointer' }}
                      key={index}
                      onClick={() => handleSort(columnName)}
                    >
                      {columnName}
                      {sortConfig.key === columnName && (sortConfig.direction === "ascending" ? <ArrowUpward /> : <ArrowDownward />)}
                    </TableCell>
                  )
                )}
                <TableCell>View All</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.filter(row =>
                Object.keys(columns).some(columnName =>
                  row[columnName].toString().includes(filter)
                )
              ).map((row, index) => (
                <TableRow key={index}>
                  {Object.keys(columns).map((columnName, index) =>
                    columns[columnName] && <TableCell key={index}>{row[columnName]}</TableCell>
                  )}
                  <TableCell>
                    <Button size='small' variant="outlined" color="primary" onClick={() => handleClickOpen(row)}>
                      View All
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={2000}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[]}
        />
      </Grid>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{"User Information"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>Full Name:</strong> {dialogContent.first_name} {dialogContent.last_name}<br />
            <strong>Email:</strong> {dialogContent.email}<br />
            <strong>Username:</strong> {dialogContent.username}<br />
            <strong>Phone Number:</strong> {dialogContent.phone_number}<br />
            <strong>Date of Birth:</strong> {dialogContent.date_of_birth}<br />
            <strong>Address:</strong> {dialogContent.address && `${dialogContent.address.street_address}, ${dialogContent.address.city}, ${dialogContent.address.state}, ${dialogContent.address.zip_code}, ${dialogContent.address.country}`}<br />
            <strong>Employment:</strong> {dialogContent.employment && `${dialogContent.employment.title} (${dialogContent.employment.key_skill})`}<br />
            <strong>Credit Card Number:</strong> {dialogContent.credit_card && dialogContent.credit_card.cc_number}<br />
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </Grid>
  </div>
}
