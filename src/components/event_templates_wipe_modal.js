import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button, Modal } from 'react-bootstrap'
import { connectModal } from 'redux-modal'

class EventTemplatesWipeModal extends Component {
  constructor(props) {
    super(props)

    this.handleConfirm = this.handleConfirm.bind(this)
  }

  handleConfirm() {
    this.props.handleDelete(this.props.system)
    this.props.handleHide()
  }

  render() {
    const { show, handleHide, handleDelete } = this.props
    if (handleDelete) {
      return (
        <Modal size='md' show={show} onHide={handleHide}>
          <Modal.Header className='bg-light' closeButton>
            <Modal.Title>Confirm Wipe</Modal.Title>
          </Modal.Header>

          <Modal.Body>{`Are you sure you want to remove all ${this.props.system ? '' : 'NON-'}SYSTEM event templates from the local database?`}</Modal.Body>

          <Modal.Footer>
            <Button size='sm' variant='secondary' onClick={handleHide}>
              Cancel
            </Button>
            <Button size='sm' variant='danger' onClick={this.handleConfirm}>
              Yup!
            </Button>
          </Modal.Footer>
        </Modal>
      )
    } else {
      return null
    }
  }
}

EventTemplatesWipeModal.propTypes = {
  handleDelete: PropTypes.func,
  handleHide: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
  system: PropTypes.bool
}

export default connectModal({ name: 'eventTemplatesWipe' })(EventTemplatesWipeModal)
