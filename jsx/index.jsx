const URL = (url) => {
  return `https://cors.bridged.cc/${url}`;
};

const LIST_OF_COUNTRIES = 'https://raw.githubusercontent.com/ehom/address-data-repo/master/addressData/countries.json';

class App extends React.Component {
  state = {
    countries: undefined,
    selection: [],
    selected: []
  };

  componentDidMount() {
    console.debug("componentDidMount");

    fetchJson(LIST_OF_COUNTRIES)
      .then((json) => {
        console.debug(json);

        this.setState({
          countries: json,
          selection: Object.keys(json)
        });
        this.randomize();
      });
  }

  componentDidUpdate() {
    console.debug("componentDidUpdate");
    const menu = document.getElementById('countryMenu');

    let result = ['<select>'];
    for (const childNode of menu.childNodes) {
      console.debug("childNode: ", childNode.outerHTML);
      result.push(childNode.outerHTML);
    }

    result.push('</select>');

    const textarea = document.getElementById('htmlSource');
    textarea.value = result.join('\n');
  }

  buttonClicked(e) {
    console.debug(`Button ${e.target.name} was clicked`);

    const countryCode = e.target.name;
    
    let selected = this.state.selected;
    
    const index = selected.indexOf(countryCode);
    index >= 0 ? selected.splice(index, 1) : selected.push(countryCode);
    console.debug(selected);
    
    this.setState({
      selected: selected
    });
  }

  makeBadges(countries, selected) {
    console.debug("makeBadges:", Object.keys(countries));
    // convert kv table to sorted array of [countryName, countryCode]
    
    console.debug("assoc array to array: ", Object.entries(countries));
    const sortedEntries = Object.entries(countries).sort((a, b) => {
      return a[1].localeCompare(b[1]);
    });
    return sortedEntries.map(([code, name], index) => {
      let buttonClass = "btn btn-secondary badge-pill";
      buttonClass = selected.includes(code)
        ? `${buttonClass} badge-warning`
        : `${buttonClass} badge-light`;

      return (
        <React.Fragment>
          {index > 0 && index % 20 === 0 ? (
            <React.Fragment>
              <br />
              <br />
            </React.Fragment>
          ) : ("")}
          <button
            type="button"
            title={code}
            name={code}
            className={buttonClass}
            key={code}
            onClick={this.buttonClicked.bind(this)}
          >
            {name}
          </button>
          &nbsp;
        </React.Fragment>
      );
    });
  }

  selectAll() {
    console.debug("selectAll");
    this.setState({
      selected: this.state.selection
    });
  }

  randomize() {
    this.clickAway(() => {
      this.randomSelections();
    }, 5, 500);
  }

  clickAway(task, repetitions, delay) {
    let x = 0;
    let intervalID = window.setInterval(() => {
      task();
      if (++x === repetitions) {
        window.clearInterval(intervalID);
      }
    }, delay);
  }

  randomSelections() {
    console.debug("randomSelections");
    
    let shuffleThis = [...this.state.selection];
    this.setState({
      selected: shuffle(shuffleThis).slice(0, 25)
    });
  }

  clearSelections() {
    console.debug("clearSelections");
    this.setState({
      selected: []
    });
  }

  showSource() {
    const menu = document.getElementById('countryMenu');
    menu && console.debug("outerHTML:", menu.outerHTML);
  }

  render() {
    console.debug("render");

    if (this.state.selection.length === 0) return null;

    console.debug("render countries:", this.state.countries);

    const badges = this.makeBadges(this.state.countries, this.state.selected);

    return (
      <div className="container mt-5 mb-5 pb-5">
        <div className="row">
          <div className="col-md-6">
            <main className="container border border-info rounded p-3">
              <h3>{"Select Countries"}</h3>

              <div className="flex-container">
                <button type="button"
                  className="btn btn-outline-primary btn-sm mr-3"
                  onClick={this.selectAll.bind(this)}>{"Select All"}</button>
                  <button type="button" id="randomSelections"
                    className="btn btn-outline-primary btn-sm mr-3"
                    onClick={this.randomize.bind(this)}>{"Random Selections"}</button>
                  <button type="button"
                    className="btn btn-outline-primary btn-sm mr-3"
                    onClick={this.clearSelections.bind(this)}>{"Clear Selections"}</button>
              </div>
              <hr />
              <div>{badges}</div>
          </main>
        </div>
          <div className="col-md-6">
            <div className="border border-primary rounded p-3 mb-2">
              <h3>{"Dropdown Menu"}</h3>
              <CountrySelector items={this.state.selected} countries={this.state.countries} />
            </div>
            <div className="border border-primary rounded p-3 mb-2">
              <textarea id="htmlSource" className="form-control" cols="40" rows="100"></textarea>
            </div>
          </div>
        </div>

        <hr />

        <footer className="container bg-light p-3">
          <h5>{"Reference"}</h5>
          <div>
          Google's <a href="https://chromium-i18n.appspot.com/ssl-address/data">Address Data Service</a>
          </div>
        </footer>
      </div>
    );
  }
}

function CountrySelector({items, countries}) {
  console.debug("countries:", countries);
  // build a sorted list of (countryName, countryCode) pairs
  const sortedPairs = items.map((countryCode) => {
    return [countries[countryCode], countryCode];
  })
  .sort((a, b) => {
    return a[0].localeCompare(b[0]);
  });
  
  const options = sortedPairs.map((entry) => {
    const [name, code] = entry;
    return <option value={code}>{name}</option>;
  });
  
  return (
    <select id="countryMenu" className="form-control">
      {options}
    </select>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
