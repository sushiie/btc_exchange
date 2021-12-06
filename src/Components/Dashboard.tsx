import axios from "axios";
import React, { useEffect, useState } from "react";
import useDebounce from "../Hooks/UseDebounce";
import "./Dashboard.css";

export const Dashboard: React.FC<{}> = (props) => {
  const [tradingPairsList, setTradingPairsList] = useState<any[]>([]);
  const [tradingPairsListMaster, setTradingPairsListMaster] = useState<any[]>(
    []
  );
  const [selectedTicker, setSelectedTicker] = useState<any>(null);
  const [selectedTickerData, setSelectedTickerData] = useState<any>(null);
  const [searchText, setSearchText] = useState<string>("");
  const debouncedSearchTerm = useDebounce(searchText, 500);
  const [timer, setTimer] = useState<any>(null);

  useEffect(() => {
    getMasterData();
    setTimer(setInterval(() => getMasterData(), 5000));
    return () => {
      setTimer(null);
    };
  }, []);

  const getMasterData = () => {
    axios
      .get("https://api-pub.bitfinex.com/v2/tickers?symbols=ALL")
      .then(({ data }) => {
        setTradingPairsList(data);
        setTradingPairsListMaster(data);
      })
      .catch(() => {
        setTradingPairsList([]);
        setTradingPairsListMaster([]);
      });
  };

  const handleSelectTicker = (ticker: any) => {
    setSelectedTicker(ticker);
  };

  const getDataForSelectedTicker = (ticker: any) => {
    axios
      .get(`https://api-pub.bitfinex.com/v2/ticker/${ticker[0]}`)
      .then(({ data }) => {
        setSelectedTickerData([ticker[0], ...data]);
      })
      .catch(() => {
        setSelectedTickerData(null);
      });
  };

  useEffect(() => {
    selectedTicker && getDataForSelectedTicker(selectedTicker);
  }, [selectedTicker]);

  const renderTickerData = () => {
    const [
      SYMBOL,
      BID,
      BID_SIZE,
      ASK,
      ASK_SIZE,
      DAILY_CHANGE,
      DAILY_CHANGE_RELATIVE,
      LAST_PRICE,
      VOLUME,
      HIGH,
      LOW,
    ] = selectedTicker;

    const name = `${SYMBOL.substr(1, 3)} / ${SYMBOL.substr(4)}`;
    return (
      <>
        <div className="right-header">
          <h1>{name}</h1>
          <h2>
            <span>${LAST_PRICE.toFixed(2)}</span>
            <span
              className={`${
                Number(DAILY_CHANGE) < 0 ? "red-text" : "green-text"
              }`}
            >
              {DAILY_CHANGE.toFixed(2)}%
            </span>
          </h2>
        </div>
        <div className="details-section">
          <table>
            <tr>
              <th>high</th>
              <th>low</th>
              <th>volumn</th>
            </tr>
            <tr>
              <td>${HIGH.toFixed(2)}</td>
              <td>${LOW.toFixed(2)}</td>
              <td>{VOLUME}</td>
            </tr>
          </table>
        </div>
      </>
    );
  };

  useEffect(() => {
    if (debouncedSearchTerm) {
      let updatedList = [...tradingPairsListMaster];
      console.log(updatedList);
      updatedList = updatedList.filter((listItem: any) => {
        return listItem[0].toLowerCase().includes(debouncedSearchTerm);
      });
      setTradingPairsList(updatedList);
    } else {
      setTradingPairsList([...tradingPairsListMaster]);
    }
    // eslint-disable-next-line
  }, [debouncedSearchTerm]);

  return (
    <div className="wrapper">
      <div className="left-pane">
        <input
          placeholder="Search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <ul>
          {tradingPairsList.length > 0 &&
            tradingPairsList.map((ticker: any) => {
              const [
                SYMBOL,
                BID,
                BID_SIZE,
                ASK,
                ASK_SIZE,
                DAILY_CHANGE,
                DAILY_CHANGE_RELATIVE,
                LAST_PRICE,
                VOLUME,
                HIGH,
                LOW,
              ] = ticker;
              const name = `${SYMBOL.substr(1, 3)} / ${SYMBOL.substr(4)}T`;
              return (
                <li
                  onClick={() => handleSelectTicker(ticker)}
                  className={`${
                    selectedTicker?.[0] === SYMBOL ? "active" : ""
                  }`}
                  key={SYMBOL}
                >
                  <div className="line-item-heading">
                    <span className="line-item-head-content">{name}</span>
                    <span className="line-item-head-content">
                      ${LAST_PRICE.toFixed(2)}
                    </span>
                  </div>
                  <div className="line-item-small-text">
                    <span className="line-item-head-content">
                      Vol: {VOLUME}
                    </span>
                    <span
                      className={`line-item-head-content ${
                        Number(DAILY_CHANGE) < 0 ? "red-text" : "green-text"
                      }`}
                    >
                      {DAILY_CHANGE.toFixed(2)}%
                    </span>
                  </div>
                </li>
              );
            })}
        </ul>
      </div>
      <div className="right-pane">
        {selectedTickerData
          ? renderTickerData()
          : "Please select a ticker from left"}
      </div>
    </div>
  );
};
