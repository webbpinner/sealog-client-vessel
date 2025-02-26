import React, { Component } from 'react'
import { connectModal } from 'redux-modal'
import PropTypes from 'prop-types'
import { Button, Modal, Row, Col } from 'react-bootstrap'
import ReactFileReader from 'react-file-reader'

class ImportFromFileModal extends Component {
  constructor(props) {
    super(props)

    this.state = {
      pending: 0,
      imported: 0,
      errors: 0,
      error_log: [],
      skipped: 0,
      quit: false
    }

    this.quitImport = this.quitImport.bind(this)
    this.handleImport = this.handleImport.bind(this)
  }

  quitImport() {
    this.setState({ quit: true })
    this.props.handleExit()
    this.props.handleHide()
  }

  async handleImport(files) {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        let json = JSON.parse(e.target.result)
        this.setState({
          pending: json.length,
          imported: 0,
          errors: 0,
          skipped: 0
        })

        let currentItem = null

        for (let i = 0; i < json.length; i++) {
          if (this.state.quit) {
            break
          }
          currentItem = json[i]
          const result = await this.props.insertItem(currentItem)

          this.setState((prevState) => ({
            pending: prevState.pending - 1,
            skipped: result.skipped ? prevState.skipped + 1 : prevState.skipped,
            imported: result.imported ? prevState.imported + 1 : prevState.imported,
            errors: result.error ? prevState.errors + 1 : prevState.errors,
            error_log: result.error ? [...prevState.error_log, result.error] : prevState.error_log
          }))
        }
      } catch (error) {
        console.error('Error when trying to parse json = ' + error)
      }
      this.setState({ pending: this.state.quit ? 'Quit Early!' : 'Complete' })
    }
    reader.readAsText(files[0])
  }

  render() {
    const { show, title } = this.props

    return (
      <Modal size='md' show={show} onExit={this.quitImport} onHide={this.quitImport} scrollable>
        <Modal.Header className='bg-light' closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Row>
            <Col xs={6}>
              <ReactFileReader fileTypes={['.json']} handleFiles={this.handleImport}>
                <Button variant='outline-primary' size='sm'>
                  Select File
                </Button>
              </ReactFileReader>
            </Col>
            <Col sm={6} xs={4}>
              Pending: {this.state.pending}
              <hr />
              Imported: {this.state.imported}
              <br />
              Skipped: {this.state.skipped}
              <br />
              Errors: {this.state.errors}
            </Col>
          </Row>
          {this.state.error_log.length ? (
            <Row>
              <Col>
                Error log:
                <br />
                <pre style={{ fontSize: '.85rem' }}>
                  {this.state.error_log.map((error) => {
                    return `Record: ${error.id}: ${error.message}\n`
                  })}
                </pre>
              </Col>
            </Row>
          ) : null}
        </Modal.Body>

        <Modal.Footer>
          <Button size='sm' variant='outline-secondary' onClick={this.quitImport}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }
}

ImportFromFileModal.propTypes = {
  handleHide: PropTypes.func.isRequired,
  handleExit: PropTypes.func,
  insertItem: PropTypes.func,
  show: PropTypes.bool.isRequired,
  title: PropTypes.string
}

export default connectModal({ name: 'importFromFileModal' })(ImportFromFileModal)

// import React, { Component } from 'react'
// import { connectModal } from 'redux-modal'
// import PropTypes from 'prop-types'
// import { Button, Modal, Row, Col } from 'react-bootstrap'
// import ReactFileReader from 'react-file-reader'
// import { create_event_aux_data, get_event_aux_data } from '../api'

// class ImportAuxDataModal extends Component {
//   constructor(props) {
//     super(props)

//     this.state = {
//       pending: 0,
//       imported: 0,
//       errors: 0,
//       updated: 0,
//       quit: false
//     }

//     this.quitImport = this.quitImport.bind(this)
//     this.handleCruiseImport = this.handleCruiseImport.bind(this)
//   }

//   quitImport() {
//     this.setState({ quit: true })
//     this.props.handleExit()
//     this.props.handleHide()
//   }

//   async insertAuxData({
//     id,
//     event_id,
//     data_source,
//     data_array
//   }) {
//     const aux_data = await get_event_aux_data({}, id)

//     if (aux_data) {
//       this.setState((prevState) => ({
//         skipped: prevState.skipped + 1,
//         pending: prevState.pending - 1
//       }))
//       return
//     }

//     const response = await create_event_aux_data({
//       id,
//       event_id,
//       data_source,
//       data_array
//     })

//     if (response.success) {
//       this.setState((prevState) => ({
//         imported: prevState.imported + 1,
//         pending: prevState.pending - 1
//       }))
//       return
//     }

//     this.setState((prevState) => ({
//       errors: prevState.errors + 1,
//       pending: prevState.pending - 1
//     }))
//   }

//   handleAuxDataRecordImport(files) {
//     const reader = new FileReader()
//     reader.onload = async (e) => {
//       try {
//         let json = JSON.parse(e.target.result)
//         this.setState({
//           pending: json.length,
//           imported: 0,
//           errors: 0,
//           skipped: 0
//         })

//         let currentAuxData

//         for (let i = 0; i < json.length; i++) {
//           if (this.state.quit) {
//             break
//           }
//           currentAuxData = json[i]
//           await this.insertCruise(currentAuxData)
//         }
//       } catch (error) {
//         console.error('Error when trying to parse json = ' + error)
//       }
//       this.setState({ pending: this.state.quit ? 'Quit Early!' : 'Complete' })
//     }
//     reader.readAsText(files[0])
//   }

//   render() {
//     const { show } = this.props

//     return (
//       <Modal size='md' show={show} onHide={this.handleHideCustom}>
//         <Modal.Header className='bg-light' closeButton>
//           <Modal.Title>Import Auxiliary Data</Modal.Title>
//         </Modal.Header>

//         <Modal.Body>
//           <Row>
//             <Col xs={6}>
//               <ReactFileReader fileTypes={['.json']} handleFiles={this.handleAuxDataRecordImport}>
//                 <Button size='sm'>Select File</Button>
//               </ReactFileReader>
//             </Col>
//             <Col xs={6}>
//               Pending: {this.state.pending}
//               <hr />
//               Imported: {this.state.imported}
//               <br />
//               Updated: {this.state.updated}
//               <br />
//               Errors: {this.state.errors}
//               <br />
//             </Col>
//           </Row>
//         </Modal.Body>

//         <Modal.Footer>
//           <Button size='sm' variant='secondary' onClick={this.handleHideCustom}>
//             Close
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     )
//   }
// }

// ImportAuxDataModal.propTypes = {
//   handleHide: PropTypes.func.isRequired,
//   handleExit: PropTypes.func,
//   show: PropTypes.bool.isRequired
// }

// export default connectModal({ name: 'importAuxData' })(ImportAuxDataModal)
