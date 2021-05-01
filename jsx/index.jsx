const ADDRESS_DATA_URL = (countryCode) => {
  return `https://chromium-i18n.appspot.com/ssl-address/data/${countryCode}`;
};

class App extends React.Component {
  state = {
    countries: undefined,
    selection: [],
    selected: []
  };

  componentDidMount() {
    console.debug("componentDidMount");

    fetchJson("https://chromium-i18n.appspot.com/ssl-address/data")
      .then((json) => {
        console.debug(json);

        const codes = json.countries.split("~");
        const table = codes.reduce((accumulator, code) => {
          accumulator[code] = {};
          return accumulator;
        }, {});

        this.setState({
          countries: table,
          selection: Object.keys(table),
        });

        return table;
      })
      .then((table) => {
        console.debug("do something with the table now......");
        const promises = this.makePromises(Object.keys(table));
        Promise.all(promises).then((countryCodes) => {
          console.debug(
            "*********** All promises fulfilled *************",
            countryCodes
          );
          this.randomize();
        });
      });
  }
  
  componentDidUpdate() {
    console.debug("componentDidUpdate");
    const element = document.getElementById('countryMenu');
    element && console.debug("countryMenu:", element.outerHTML);
    const textarea = document.getElementById('htmlSource');
    (element && textarea) && (textarea.value = element.outerHTML);
  }

  makePromise(countryCode) {
    return new Promise((resolve, reject) => {
      fetchJson(ADDRESS_DATA_URL(countryCode)).then((json) => {
        console.debug("country data:", json);

        let lookupTable = this.state.countries;

        lookupTable[countryCode] = {
          data: json
        };

        this.setState({
          countries: lookupTable,
          selection: Object.keys(lookupTable)
        });
        resolve(countryCode);
      });
    });
  }

  makePromises(countryCodes) {
    const promises = countryCodes.map((countryCode) => {
      return this.makePromise(countryCode);
    });
    return promises;
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

  makeBadges(countryCodes, selected) {
    return countryCodes.map((code, index) => {
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
            {this.state.countries[code].data
              ? this.state.countries[code].data.name
              : code}
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

  render() {
    console.debug("render");

    if (this.state.selection.length === 0) return null;

    console.debug(this.state.countries);

    // const selected = this.makeBadges(this.state.selected);
    const badges = this.makeBadges(this.state.selection, this.state.selected);

    return (
      <div className="container mt-5 mb-5 pb-5">
        <div className="row">
          <div className="col-md-6">
            <div className="container border border-info rounded p-3">
            <h3>Select Countries</h3>

            <div className="flex-container">
              <button type="button"
                key="selectAll"
                className="btn btn-outline-primary btn-sm mr-3"
                onClick={this.selectAll.bind(this)}>Select All</button>
              <button key="randomSelections" type="button" id="randomSelections"
                className="btn btn-outline-primary btn-sm mr-3"
                onClick={this.randomize.bind(this)}>Random Selections</button>
              <button type="button"
                key="clearSelections"
                className="btn btn-outline-primary btn-sm mr-3"
                onClick={this.clearSelections.bind(this)}>Clear Selections</button>
            </div>
            <hr />
            <div>{badges}</div>
          </div>
      </div>
          <div className="col-md-6">
            <div className="border border-primary rounded p-3 mb-2">
              <h3>Dropdown Menu</h3>
              <CountrySelector items={this.state.selected} countries={this.state.countries} />
            </div>
            <div className="border border-primary rounded p-3 mb-2">
              <textarea id="htmlSource" className="form-control" rows="100"></textarea>
            </div>
          </div>
        </div>
        <hr />
        <footer className="container bg-light p-3">
          <h5>Data Source</h5>
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
    return [countries[countryCode].data.name, countryCode];
  })
  .sort((a, b) => {
    return a[0].localeCompare(b[0]);
  });
  
  const options = sortedPairs.map((entry) => {
    const [name, code] = entry;
    return <option key={code} value={code}>{name}</option>;
  });
  
  return (
    <select id="countryMenu" className="form-control">
      {options}
    </select>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
