import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { connect } from 'react-redux'
import { Row, Button, Col, Container, Card, Form, FormControl, Table, OverlayTrigger, Tooltip } from 'react-bootstrap'
import PropTypes from 'prop-types'
import UserForm from './user_form'
import DisplayUserTokenModal from './display_user_token_modal'
import NonSystemUsersWipeModal from './non_system_users_wipe_modal'
import ImportUsersModal from './import_users_modal'
import DeleteUserModal from './delete_user_modal'
import UserPermissionsModal from './user_permissions_modal'
import CustomPagination from './custom_pagination'
import { USE_ACCESS_CONTROL } from '../client_settings'
import { _Cruise_ } from '../vocab'
import * as mapDispatchToProps from '../actions'

const disabledAccounts = ['admin', 'guest', 'pi']

let fileDownload = require('js-file-download')

const maxSystemUsersPerPage = 4
const maxUsersPerPage = 6

const tableHeaderStyle = { width: USE_ACCESS_CONTROL ? '110px' : '90px' }

class Users extends Component {
  constructor(props) {
    super(props)

    this.state = {
      activePage: 1,
      activeSystemPage: 1,
      filteredUsers: null,
      filteredSystemUsers: null
    }

    this.handlePageSelect = this.handlePageSelect.bind(this)
    this.handleSystemPageSelect = this.handleSystemPageSelect.bind(this)
    this.handleUserImportClose = this.handleUserImportClose.bind(this)
    this.handleSearchChange = this.handleSearchChange.bind(this)
    this.handleSystemSearchChange = this.handleSystemSearchChange.bind(this)
  }

  componentDidMount() {
    this.props.fetchUsers()
  }

  handlePageSelect(eventKey) {
    this.setState({ activePage: eventKey })
  }

  handleSystemPageSelect(eventKey) {
    this.setState({ activeSystemPage: eventKey })
  }

  handleUserDeleteModal(id) {
    this.props.showModal('deleteUser', {
      id: id,
      handleDelete: this.props.deleteUser
    })
  }

  handleNonSystemUsersWipe() {
    this.props.showModal('nonSystemUsersWipe', {
      handleDelete: this.props.deleteAllNonSystemUsers
    })
  }

  handleDisplayUserToken(id) {
    this.props.showModal('displayUserToken', { id: id })
  }

  handleUserUpdate(id) {
    this.props.initUser(id)
  }

  handleUserCreate() {
    this.props.leaveUserForm()
  }

  handleUserImportModal() {
    this.props.showModal('importUsers')
  }

  handleUserPermissionsModal(user_id) {
    this.props.showModal('userPermissions', { user_id: user_id })
  }

  handleUserImportClose() {
    this.props.fetchUsers()
  }

  handleSearchChange(event) {
    let fieldVal = event.target.value
    if (fieldVal !== '') {
      this.setState({
        filteredUsers: this.props.users.filter((user) => {
          const regex = RegExp(fieldVal, 'i')
          if (user.system_user === false && (user.username.match(regex) || user.email.match(regex) || user.fullname.match(regex))) {
            return user
          }
        }),
        activePage: 1
      })
    } else {
      this.setState({ filteredUsers: null })
    }
    this.handlePageSelect(1)
  }

  handleSystemSearchChange(event) {
    let fieldVal = event.target.value
    if (fieldVal !== '') {
      this.setState({
        filteredSystemUsers: this.props.users.filter((user) => {
          const regex = RegExp(fieldVal, 'i')
          if (user.system_user === true && (user.username.match(regex) || user.email.match(regex) || user.fullname.match(regex))) {
            return user
          }
        }),
        activeSystemPage: 1
      })
    } else {
      this.setState({ filteredSystemUsers: null })
    }
    this.handlePageSelect(1)
  }

  exportUsersToJSON() {
    fileDownload(
      JSON.stringify(
        this.props.users.filter((user) => user.system_user === false),
        null,
        2
      ),
      'sealog_userExport.json'
    )
  }

  exportSystemUsersToJSON() {
    fileDownload(
      JSON.stringify(
        this.props.users.filter((user) => user.system_user === true),
        null,
        2
      ),
      'sealog_systemUserExport.json'
    )
  }

  renderAddUserButton() {
    if (!this.props.showform) {
      return (
        <Button variant='primary' size='sm' onClick={() => this.handleUserCreate()} disabled={!this.props.userid}>
          Add User
        </Button>
      )
    }
  }

  renderImportUsersButton() {
    if (this.props.roles.includes('admin')) {
      return (
        <Button className='mr-1' variant='primary' size='sm' onClick={() => this.handleUserImportModal()}>
          Import From File
        </Button>
      )
    }
  }

  renderUsers() {
    const editTooltip = <Tooltip id='editTooltip'>Edit this user.</Tooltip>
    const tokenTooltip = <Tooltip id='tokenTooltip'>Show user&apos;s JWT token.</Tooltip>
    const deleteTooltip = <Tooltip id='deleteTooltip'>Delete this user.</Tooltip>
    const permissionTooltip = <Tooltip id='permissionTooltip'>{_Cruise_} permissions.</Tooltip>

    let users = Array.isArray(this.state.filteredUsers)
      ? this.state.filteredUsers
      : this.props.users.filter((user) => user.system_user === false)
    users = users.slice((this.state.activePage - 1) * maxUsersPerPage, this.state.activePage * maxUsersPerPage)

    return users.map((user) => {
      const style = user.disabled ? { textDecoration: 'line-through' } : {}
      const className = this.props.userid === user.id ? 'text-warning' : ''

      return (
        <tr key={user.id}>
          <td style={style} className={className}>
            {user.username}
          </td>
          <td style={style} className={className}>
            {user.fullname}
          </td>
          <td className='text-center'>
            <OverlayTrigger placement='top' overlay={editTooltip}>
              <FontAwesomeIcon className='text-warning' onClick={() => this.handleUserUpdate(user.id)} icon='pencil-alt' fixedWidth />
            </OverlayTrigger>{' '}
            {USE_ACCESS_CONTROL && this.props.roles.includes('admin') ? (
              <OverlayTrigger placement='top' overlay={permissionTooltip}>
                <FontAwesomeIcon
                  className='text-primary'
                  onClick={() => this.handleUserPermissionsModal(user.id)}
                  icon='user-lock'
                  fixedWidth
                />
              </OverlayTrigger>
            ) : (
              ''
            )}{' '}
            {this.props.roles.includes('admin') ? (
              <OverlayTrigger placement='top' overlay={tokenTooltip}>
                <FontAwesomeIcon className='text-success' onClick={() => this.handleDisplayUserToken(user.id)} icon='eye' fixedWidth />
              </OverlayTrigger>
            ) : (
              ''
            )}{' '}
            {user.id !== this.props.profileid && !disabledAccounts.includes(user.username) ? (
              <OverlayTrigger placement='top' overlay={deleteTooltip}>
                <FontAwesomeIcon className='text-danger' onClick={() => this.handleUserDeleteModal(user.id)} icon='trash' fixedWidth />
              </OverlayTrigger>
            ) : (
              ''
            )}
          </td>
        </tr>
      )
    })
  }

  renderSystemUsers() {
    const editTooltip = <Tooltip id='editTooltip'>Edit this user.</Tooltip>
    const tokenTooltip = <Tooltip id='tokenTooltip'>Show user&apos;s JWT token.</Tooltip>
    const deleteTooltip = <Tooltip id='deleteTooltip'>Delete this user.</Tooltip>
    const permissionTooltip = <Tooltip id='permissionTooltip'>{_Cruise_} permissions.</Tooltip>

    let system_users = Array.isArray(this.state.filteredSystemUsers)
      ? this.state.filteredSystemUsers
      : this.props.users.filter((user) => user.system_user === true)
    system_users = system_users.slice(
      (this.state.activeSystemPage - 1) * maxSystemUsersPerPage,
      this.state.activeSystemPage * maxSystemUsersPerPage
    )

    return system_users.map((user) => {
      const style = user.disabled ? { textDecoration: 'line-through' } : {}
      if (user.system_user) {
        return (
          <tr key={user.id}>
            <td style={style} className={this.props.userid === user.id ? 'text-warning' : ''}>
              {user.username}
            </td>
            <td style={style}>{user.fullname}</td>
            <td className='text-center'>
              {this.props.roles.includes('admin') ? (
                <OverlayTrigger placement='top' overlay={editTooltip}>
                  <FontAwesomeIcon className='text-warning' onClick={() => this.handleUserUpdate(user.id)} icon='pencil-alt' fixedWidth />
                </OverlayTrigger>
              ) : (
                ''
              )}{' '}
              {USE_ACCESS_CONTROL && this.props.roles.includes('admin') ? (
                <OverlayTrigger placement='top' overlay={permissionTooltip}>
                  <FontAwesomeIcon
                    className='text-primary'
                    onClick={() => this.handleUserPermissionsModal(user.id)}
                    icon='user-lock'
                    fixedWidth
                  />
                </OverlayTrigger>
              ) : (
                ''
              )}{' '}
              {this.props.roles.includes('admin') ? (
                <OverlayTrigger placement='top' overlay={tokenTooltip}>
                  <FontAwesomeIcon className='text-success' onClick={() => this.handleDisplayUserToken(user.id)} icon='eye' fixedWidth />
                </OverlayTrigger>
              ) : (
                ''
              )}{' '}
              {user.id !== this.props.profileid && !disabledAccounts.includes(user.username) ? (
                <OverlayTrigger placement='top' overlay={deleteTooltip}>
                  <FontAwesomeIcon className='text-danger' onClick={() => this.handleUserDeleteModal(user.id)} icon='trash' fixedWidth />
                </OverlayTrigger>
              ) : (
                ''
              )}
            </td>
          </tr>
        )
      }
    })
  }

  renderUserTable() {
    if (this.props.users.filter((user) => user.system_user === false).length > 0) {
      return (
        <Table responsive bordered striped size='sm'>
          <thead>
            <tr>
              <th>User Name</th>
              <th>Full Name</th>
              <th className='text-center' style={tableHeaderStyle}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>{this.renderUsers()}</tbody>
        </Table>
      )
    } else {
      return <Card.Body>No Users Found!</Card.Body>
    }
  }

  renderSystemUserTable() {
    if (this.props.users.filter((user) => user.system_user === true).length > 0) {
      return (
        <Table responsive bordered striped size='sm'>
          <thead>
            <tr>
              <th>User Name</th>
              <th>Full Name</th>
              <th className='text-center' style={tableHeaderStyle}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>{this.renderSystemUsers()}</tbody>
        </Table>
      )
    } else {
      return <Card.Body>No System Users Found!</Card.Body>
    }
  }

  renderUsersHeader() {
    const Label = 'Users'

    const exportTooltip = <Tooltip id='exportTooltip'>Export Users</Tooltip>
    const deleteAllNonSystemTooltip = <Tooltip id='deleteAllNonSystemTooltip'>Delete all non-system Users</Tooltip>

    const disableBtn = this.props.users.filter((user) => user.system_user === false).length > 0 ? false : true

    return (
      <div>
        {Label}
        <div className='float-right'>
          <Form inline>
            <FormControl size='sm' type='text' placeholder='Search' className='mr-sm-2' onChange={this.handleSearchChange} />
            <OverlayTrigger placement='top' overlay={deleteAllNonSystemTooltip}>
              <FontAwesomeIcon
                className='text-danger'
                onClick={() => this.handleNonSystemUsersWipe()}
                disabled={disableBtn}
                icon='trash'
                fixedWidth
              />
            </OverlayTrigger>{' '}
            <OverlayTrigger placement='top' overlay={exportTooltip}>
              <FontAwesomeIcon
                className='text-primary'
                onClick={() => this.exportUsersToJSON()}
                disabled={disableBtn}
                icon='download'
                fixedWidth
              />
            </OverlayTrigger>
          </Form>
        </div>
      </div>
    )
  }

  renderSystemUsersHeader() {
    const Label = 'System Users'
    const exportTooltip = <Tooltip id='exportTooltip'>Export System Users</Tooltip>
    let export_icon = this.props.roles.includes('admin') ? (
      <OverlayTrigger placement='top' overlay={exportTooltip}>
        <FontAwesomeIcon className='text-primary' onClick={() => this.exportSystemUsersToJSON()} icon='download' fixedWidth />
      </OverlayTrigger>
    ) : null

    return (
      <div>
        {Label}
        <div className='float-right'>
          <Form inline>
            <FormControl size='sm' type='text' placeholder='Search' className='mr-sm-2' onChange={this.handleSystemSearchChange} />
            {export_icon}
          </Form>
        </div>
      </div>
    )
  }

  render() {
    if (!this.props.roles) {
      return <div>Loading...</div>
    }

    if (this.props.roles.some((item) => ['admin', 'cruise_manager'].includes(item))) {
      return (
        <Container className='mt-2'>
          <DisplayUserTokenModal />
          <DeleteUserModal />
          <ImportUsersModal handleExit={this.handleUserImportClose} />
          <NonSystemUsersWipeModal />
          <UserPermissionsModal onClose={this.props.fetchCruises} />
          <Row>
            <Col className='px-1' sm={12} md={7} lg={{ span: 6, offset: 1 }} xl={{ span: 5, offset: 2 }}>
              {this.props.roles.includes('admin') ? (
                <Card className='border-secondary' key='system_users_card'>
                  <Card.Header>{this.renderSystemUsersHeader()}</Card.Header>
                  {this.renderSystemUserTable()}
                  <CustomPagination
                    className='mt-2'
                    page={this.state.activeSystemPage}
                    count={
                      this.state.filteredSystemUsers
                        ? this.state.filteredSystemUsers.length
                        : this.props.users.filter((user) => user.system_user === true).length
                    }
                    pageSelectFunc={this.handleSystemPageSelect}
                    maxPerPage={maxSystemUsersPerPage}
                  />
                </Card>
              ) : null}
              <Card className='border-secondary mt-2'>
                <Card.Header>{this.renderUsersHeader()}</Card.Header>
                {this.renderUserTable()}
                <CustomPagination
                  className='mt-2'
                  page={this.state.activePage}
                  count={
                    this.state.filteredUsers
                      ? this.state.filteredUsers.length
                      : this.props.users.filter((user) => user.system_user === false).length
                  }
                  pageSelectFunc={this.handlePageSelect}
                  maxPerPage={maxUsersPerPage}
                />
              </Card>
              <div className='float-right mt-2'>
                {this.renderImportUsersButton()}
                {this.renderAddUserButton()}
              </div>
            </Col>
            <Col className='px-1' sm={12} md={5} lg={4} xl={3}>
              <UserForm handleFormSubmit={this.props.fetchUsers} />
            </Col>
          </Row>
        </Container>
      )
    } else {
      return <div>What are YOU doing here?</div>
    }
  }
}

Users.propTypes = {
  deleteAllNonSystemUsers: PropTypes.func.isRequired,
  deleteUser: PropTypes.func.isRequired,
  fetchCruises: PropTypes.func.isRequired,
  fetchUsers: PropTypes.func.isRequired,
  initUser: PropTypes.func.isRequired,
  leaveUserForm: PropTypes.func.isRequired,
  profileid: PropTypes.string,
  roles: PropTypes.array,
  showform: PropTypes.bool,
  showModal: PropTypes.func.isRequired,
  userid: PropTypes.string,
  users: PropTypes.array.isRequired
}

const mapStateToProps = (state) => {
  return {
    users: state.user.users,
    userid: state.user.user.id,
    profileid: state.user.profile.id,
    roles: state.user.profile.roles
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Users)
