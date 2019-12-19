import React from 'react'
import './App.css'
import axios from 'axios'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import Register from './components/Register/Register'
import Login from './components/Login/Login'
import MediaList from './components/PostList/MediaList'
import Media from './components/Post/Media'
import CreateMedia from './components/Post/CreateMedia'
import EditMedia from './components/Post/EditMedia'

class App extends React.Component {
  state = {
    medias: [],
    media: null,
    token: null,
    user: null,
    filterTitle: '',
    filterCreator: '',
    filterType: '',
    mediasList: []
  }

  componentDidMount() {
      this.authenticateUser()
  }

  authenticateUser = () => {
    const token = localStorage.getItem('token')

    if(!token) {
      localStorage.removeItem('user')
      this.setState({ user: null })
    }

    if (token) {
      const config = {
        headers: {
          'x-auth-token': token
        }
      }
      axios.get('/api/auth', config)
      .then((response) => {
        localStorage.setItem('user', response.data.name)
        this.setState(
          { user: response.data.name,
            token: token
          },
          () => {
            this.loadData()
          }
          )
      })
      .catch((error) => {
        localStorage.removeItem('user')
        this.setState({ user: null })
        console.error(`Error logging in: ${error}`)
      })
    }
  }

  loadData = () => {
    const { token } = this.state

     if (token) {
       const config = {
         headers: {
           'x-auth-token': token
         }
       }
       axios
        .get('/api/medias', config)
        .then(response => {
          this.setState({
            medias: response.data,
            mediasList: response.data
          })
        })
        .catch(error => {
          console.error(`Error fetching data: ${error}`)
        })
     }
  }
  logOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.setState({ user: null, token: null });
  }

  viewMedia = media => {
    console.log(`view ${media.title}`)
    this.setState({
      media: media
    })
  }

  deleteMedia = media => {
    const { token } = this.state

    if (token) {
      const config = {
        headers: {
          'x-auth-token': token
        }
      }

      axios
        .delete(`/api/medias/${media._id}`, config)
        .then(response => {
          const newMedias = this.state.medias.filter(m => m._id !== media._id)
          this.setState({
            medias: [...newMedias],
            mediasList: [...newMedias]
          })
        })
        .catch(error => {
          console.error(`Error deleting media: ${error}`)
        })
    }
  }

  editMedia = media => {
    this.setState({
      media: media
    })
  }

  onMediaCreated = media => {
    const newMedias = [...this.state.medias, media]

    this.setState({
      medias: newMedias,
      mediasList: newMedias
    })
  }

  onMediaUpdated = media => {
    console.log('updated media: ', media)
    const newMedias = [...this.state.medias]
    const index = newMedias.findIndex(m => m._id === media._id)

    newMedias[index] = media

    this.setState({
      medias: newMedias,
      mediasList: newMedias
    })
  }
  
  onChangeFilter = e => {
    const { name, value } = e.target 

    let newMedias = this.state.medias

    if(name === "filterTitle"){
      
    newMedias = newMedias.filter(media => media.title.toLowerCase().includes(value.toLowerCase()))
    newMedias = newMedias.filter(media => media.creator.toLowerCase().includes(this.state.filterCreator))
    newMedias = newMedias.filter(media => media.type.toLowerCase().includes(this.state.filterType))

    } else if(name === "filterCreator") {
      
    newMedias = newMedias.filter(media => media.title.toLowerCase().includes(this.state.filterTitle))
    newMedias = newMedias.filter(media => media.creator.toLowerCase().includes(value.toLowerCase()))
    newMedias = newMedias.filter(media => media.type.toLowerCase().includes(this.state.filterType))

    } else {
      
    newMedias = newMedias.filter(media => media.title.toLowerCase().includes(this.state.filterTitle))
    newMedias = newMedias.filter(media => media.creator.toLowerCase().includes(this.state.filterCreator))
    newMedias = newMedias.filter(media => media.type.toLowerCase().includes(value.toLowerCase()))

    }
    console.log(newMedias)

    this.setState({
      [name]: value.toLowerCase(),
      mediasList: newMedias
    })

}

  render(){
    let { user, media, token, mediasList, filterTitle, filterCreator, filterType } = this.state;
    const authProps = {
      authenticateUser: this.authenticateUser
    }

    return (
      <Router>
      <div className="App">
        <header className="App-header">
          <h1>Media List</h1> 
          <ul>
            <li>
              <Link to="/">Home</Link>
              </li>
              <li>
                {user ? (
                  <Link to="/new-media">New Media Item</Link>
                ) : (
                  <Link to="/register">Register</Link>
                )}
              </li>
              <li>
                {
                  user ? (
                    <Link to="" onClick={this.logOut}>Log out</Link> 
                  ) : (
                    <Link to="/login">Login</Link>
                  )}
              </li>
          </ul> 
        </header>
        <main>
        <Switch>
          <Route exact path="/">
            {user ? ( 
            <React.Fragment>
              <div>Hello {user}!</div>
              <div>
              <input
              name="filterTitle"
              type="text"
              placeholder="Filter Title"
              value={filterTitle}
              onChange={e => this.onChangeFilter(e)}
              />
                            <input
              name="filterCreator"
              type="text"
              placeholder="Filter Creator"
              value={filterCreator}
              onChange={e => this.onChangeFilter(e)}
              />
                            <input
              name="filterType"
              type="text"
              placeholder="Filter Type"
              value={filterType}
              onChange={e => this.onChangeFilter(e)}
              />
              </div>
              <MediaList 
              medias={mediasList} 
              clickMedia={this.viewMedia} 
              deleteMedia={this.deleteMedia}
              editMedia={this.editMedia}/>
          </React.Fragment> 
          ) : (
          <React.Fragment> Please Register or Login </React.Fragment>
          )}
          </Route>
          <Route path="/medias/:mediaId">
            <Media media={media} />
          </Route>
          <Route path="/new-media">
            <CreateMedia token={token} onMediaCreated={this.onMediaCreated}/>
          </Route>
          <Route path="/edit-media/:mediaId">
            <EditMedia
            token={token}
            media={media}
            onMediaUpdated={this.onMediaUpdated}
            />
          </Route>
            <Route 
            exact path="/register"
              render={() => <Register {...authProps} />} />
            <Route 
            exact path="/login"
            render={() => <Login {...authProps} />} />
          </Switch>
        </main>
      </div>
      </Router>
    )
  }
}

export default App
