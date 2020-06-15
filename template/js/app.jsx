// TODO: import the consts below from env vars
const AUTH0_CLIENT_ID = "JX6BeQJbwv3D00kG1JqaYUNsjJjcSvq1";
const AUTH0_CALLBACK_URL = location.href;
const AUTH0_DOMAIN = "mdo.eu.auth0.com";
const AUTH0_API_AUDIENCE = "https://api.mdo.com";

class App extends React.Component {
    parseHash() {
      this.auth0 = new auth0.WebAuth({
        domain: AUTH0_DOMAIN,
        clientID: AUTH0_CLIENT_ID
      });
      this.auth0.parseHash(window.location.hash, (err, authResult) => {
        if (err) {
          return console.log(err);
        }
        if (
          authResult !== null &&
          authResult.accessToken !== null &&
          authResult.idToken !== null
        ) {
          localStorage.setItem("access_token", authResult.accessToken);
          localStorage.setItem("id_token", authResult.idToken);
          localStorage.setItem(
            "profile",
            JSON.stringify(authResult.idTokenPayload)
          );
          window.location = window.location.href.substr(
            0,
            window.location.href.indexOf("#")
          );
        }
      });
    }
  
    setup() {
      $.ajaxSetup({
        beforeSend: (r) => {
          if (localStorage.getItem("access_token")) {
            r.setRequestHeader(
              "Authorization",
              "Bearer " + localStorage.getItem("access_token")
            );
          }
        }
      });
    }
  
    setState() {
      let idToken = localStorage.getItem("id_token");
      if (idToken) {
        this.loggedIn = true;
      } else {
        this.loggedIn = false;
      }
    }
  
    componentWillMount() {
      this.setup();
      this.parseHash();
      this.setState();
    }
  
    render() {
      if (this.loggedIn) {
        return <LoggedIn />;
      }
      return <Home />;
    }
  }
  
  class Home extends React.Component {
    constructor(props) {
      super(props);
      this.authenticate = this.authenticate.bind(this);
    }
    authenticate() {
      this.WebAuth = new auth0.WebAuth({
        domain: AUTH0_DOMAIN,
        clientID: AUTH0_CLIENT_ID,
        scope: "openid profile",
        audience: AUTH0_API_AUDIENCE,
        responseType: "token id_token",
        redirectUri: AUTH0_CALLBACK_URL
      });
      this.WebAuth.authorize();
    }
  
    render() {
      return (
        <div className="container">
          <div className="row">
            <div className="col-xs-8 col-xs-offset-2 jumbotron text-center">
              <h1>Mafia Drive</h1>
              <p>Choose your game!</p>
              <p>Log in to get access </p>
              <a
                onClick={this.authenticate}
                className="btn btn-primary btn-lg btn-login btn-block"
              >
                Log In
              </a>
            </div>
          </div>
        </div>
      );
    }
  }
  
  class LoggedIn extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        games: []
      };

      this.s1 = io("/watchGames"); // ?token=" + token);
      this.s1.on('createGame', this.createGame);
  
      // this.serverRequest = this.serverRequest.bind(this);
      this.logout = this.logout.bind(this);
      this.joinGame = this.joinGame.bind(this);
      this.createGame = this.createGame.bind(this);
      this.onGameCreated = this.onGameCreated.bind(this);
    }
  
    logout() {
      localStorage.removeItem("id_token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("profile");
      location.reload();
    }
  
    // serverRequest() {
    //   $.get("http://localhost:8080/api/jokes", res => {
    //     this.setState({
    //       jokes: res
    //     });
    //   });
    // }

    createGame() {
      console.log("Creating a new game");
      this.s1.emit('createGame', 'token', function(data) {
        // $('#messages').append($('<li>').text('ACK CALLBACK: ' + data));
        console.log("--> Received a new game with data: " + data);
      });
    }

    joinGame(id) {
      console.log("Joining the game with id: " + id);
    }

    onGameCreated(newGame) {
      console.log("<-- Received a newly created game" + newGame);

      let { games } = this.state;
      let gameObj = JSON.parse(newGame);
      games.push(gameObj);
      this.setState(games);
    }
  
    componentDidMount() {
      // this.serverRequest();
      this.s1.on('listGames', res => {
            this.setState({
              games: res
            });
          });

      this.s1.on('gameCreated', this.onGameCreated);
    }

    renderTableData() {
      return this.state.games.map((game, index) => {
         const { id, author_name, result } = game
         return (
            <tr key={id}>
               <td>{author_name}</td>
               <td>{result}</td>
               <button type="button" class="btn btn-success" onClick={() => this.joinGame(id)}>Join game</button>
            </tr>
         )
      })
   }
  
    render() {
      return (
        <div className="container">
          <br />
          <span className="pull-right">
            <a onClick={this.logout}>Log out</a>
          </span>
          <h2>Mafia Drive</h2>
          <p>List of available games</p>
          <button type="button" class="btn btn-primary" onClick={this.createGame}>Create a new game</button>
          <table id='games' class="table table-striped table-hover table-responsive-md btn-table">
               <tbody>
                  {this.renderTableData()}
               </tbody>
            </table>
        </div>
      );
    }
  }
  
  // class Joke extends React.Component {
  //   constructor(props) {
  //     super(props);
  //     this.state = {
  //       liked: "",
  //       jokes: []
  //     };
  //     this.like = this.like.bind(this);
  //     this.serverRequest = this.serverRequest.bind(this);
  //   }
  
  //   like() {
  //     let joke = this.props.joke;
  //     this.serverRequest(joke);
  //   }
  //   serverRequest(joke) {
  //     $.post(
  //       "http://localhost:3000/api/jokes/like/" + joke.id,
  //       { like: 1 },
  //       res => {
  //         console.log("res... ", res);
  //         this.setState({ liked: "Liked!", jokes: res });
  //         this.props.jokes = res;
  //       }
  //     );
  //   }
  
  //   render() {
  //     return (
  //       <div className="col-xs-4">
  //         <div className="panel panel-default">
  //           <div className="panel-heading">
  //             #{this.props.joke.id}{" "}
  //             <span className="pull-right">{this.state.liked}</span>
  //           </div>
  //           <div className="panel-body joke-hld">{this.props.joke.joke}</div>
  //           <div className="panel-footer">
  //             {this.props.joke.likes} Likes &nbsp;
  //             <a onClick={this.like} className="btn btn-default">
  //               <span className="glyphicon glyphicon-thumbs-up" />
  //             </a>
  //           </div>
  //         </div>
  //       </div>
  //     );
  //   }
  // }
  ReactDOM.render(<App />, document.getElementById("app"));