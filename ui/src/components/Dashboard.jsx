import React, { useEffect, useState, useCallback, useRef } from "react";
import _ from "lodash";
import {
  Charts,
  Dropdown,
  Button,
  Modal,
  Switch,
  Divider,
  Input,
  HelpBlock,
  Card,
  CardHeader,
  CardBody,
} from "blueprint-react";
// import { getPriorityStats, getStateWiseStats } from "../service/api_service";
import moment from "moment";
import { pathPrefix } from "../App";

const configItems = [
  {
    id: 0,
    label: "Minutes",
  },
  {
    id: 1,
    label: "Hours",
  },
];

const checkTheValueOrReturnDefault = (val, defaultVal) =>
  val ? val : defaultVal;

function Dashboard(props) {
  const intervalId = useRef(null);
  const [pieChartData, setPieChartData] = useState([]);
  const [chartsData, setChartsData] = useState([]);
  const [showRefreshConfig, setShowRefreshConfig] = useState(false);

  const refresh_type = localStorage.getItem("dashboard_refresh_type");
  const refresh_value = localStorage.getItem("dashboard_refresh_value");

  const [configValue, setConfigValue] = useState(
    checkTheValueOrReturnDefault(refresh_value, 5)
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [configType, setConfigType] = useState(
    checkTheValueOrReturnDefault(refresh_type, configItems[0].label)
  );
  const autoRefreshValue = localStorage.getItem("enable_refresh");
  const [autoRefresh, setAutoRefresh] = useState(
    autoRefreshValue === "true" ? true : false
  );

  useEffect(() => {
    if (
      configType === "Minutes" &&
      (configValue < 5 || configValue > 24 * 60)
    ) {
      setErrorMessage("Value should be between 5 and 1140");
    } else if (configType === "Hours" && configValue > 24) {
      setErrorMessage("Value should be less than 24");
    } else if (!!!configValue) {
      setErrorMessage("Value should not be null");
    } else {
      setErrorMessage("");
    }
  }, [configType, configValue]);

  // const fetchStatisticsData = useCallback(() => {
  //   const typeMap = {
  //     "Day/s": "days",
  //     "Week/s": "week",
  //     "Month/s": "months",
  //   };
  //   const toDate = moment().format("YYYY-MM-DD");
  //   const value = localStorage.getItem("config_date_value");
  //   const type = localStorage.getItem("config_value");
  //   const fromDate = moment()
  //     .subtract(
  //       checkTheValueOrReturnDefault(value, 15),
  //       checkTheValueOrReturnDefault(typeMap[type], "days")
  //     )
  //     .format("YYYY-MM-DD");
  //   getPriorityStats(fromDate, toDate)
  //     .then((response) => {
  //       const list = [];
  //       response.data.result.forEach((item) => {
  //         list.push({
  //           name: Object.keys(item)[0],
  //           agents: parseInt(item[Object.keys(item)[0]]),
  //         });
  //       });
  //       setPieChartData(list);
  //     })
  //     .catch((err) => {
  //       if (err.response?.status === 401) {
  //         props.history.push({
  //           pathname: pathPrefix + "/login",
  //           state: { sessionExpired: true },
  //         });
  //       }
  //     });
  //   getStateWiseStats(fromDate, toDate)
  //     .then((response) => {
  //       const result = response.data.result[0];
  //       const list = [];
  //       const month = [
  //         "January",
  //         "February",
  //         "March",
  //         "April",
  //         "May",
  //         "June",
  //         "July",
  //         "August",
  //         "September",
  //         "October",
  //         "November",
  //         "December",
  //       ];
  //       _.forIn(result, (stateValue, dateValue) => {
  //         const date =
  //           new Date(dateValue).getDate() +
  //           " " +
  //           month[new Date(dateValue).getMonth()];
  //         list.push({
  //           name: date,
  //           ...stateValue,
  //           Open: stateValue.New,
  //           date: dateValue,
  //         });
  //       });
  //       setChartsData(list);
  //     })
  //     .catch((err) => {
  //       if (err.response?.status === 401) {
  //         props.history.push({
  //           pathname: pathPrefix + "/login",
  //           state: { sessionExpired: true },
  //         });
  //       }
  //     });
  // }, [props.history]);

  // useEffect(fetchStatisticsData, [props.history, fetchStatisticsData]);

  // const menuItems = [
  //   {
  //     label: "Refresh now",
  //     action: () => fetchStatisticsData(),
  //   },
  //   {
  //     label: "Auto refresh config",
  //     action: () => {
  //       setShowRefreshConfig(true);
  //       setAutoRefresh(
  //         localStorage.getItem("enable_refresh") === "true" ? true : false
  //       );
  //     },
  //   },
  // ];

  // const setRefreshConfig = useCallback(() => {
  //   if (autoRefresh) {
  //     intervalId.current = setInterval(
  //       fetchStatisticsData,
  //       1000 *
  //         60 *
  //         (configType === "Minutes" ? configValue : 1) *
  //         (configType === "Hours" ? configValue * 60 : 1)
  //     );
  //   }
  // }, [autoRefresh, configType, configValue, fetchStatisticsData]);

  // useEffect(() => {
  //   setRefreshConfig();
  //   return () => clearInterval(intervalId.current);
  // }, [setRefreshConfig]);

  const style = {
    top: 0,
    left: 400,
    lineHeight: "24px",
  };

  const PIE_CHART_COLORS = {
    "1 - Critical": "#E2231A",
    "2 - High": "#FF7300",
    "3 - Moderate": "#FFBF00",
    "4 - Low": "#14A792",
    "5 - Planning": "#8D8D8D",
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
    fill,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 1.33;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill={fill}
        textAnchor={"middle"}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(2)}%`}
      </text>
    );
  };

  return (
    <div className="background-container">
      <header
        class="header header--compressed"
        style={{ background: "transparent" }}
      >
        <div class="header-bar container" style={{ paddingLeft: "0px" }}>
          <div class="header-bar__main" style={{ marginLeft: "0px" }}>
            <div class="section">
              <h2 class="page-title" style={{ fontWeight: "350" }}>
                Overview
              </h2>
            </div>
          </div>
          <div
            class="header-toolbar"
            style={{ padding: "20px 0", alignSelf: "self-end" }}
          >
            <Dropdown
              key={"dropdown-tool-key-2"}
              preferredPlacements={["bottom"]}
              type={Dropdown.TYPE.BUTTON}
              size={Button.SIZE.SMALL}
              label={<>Refresh</>}
              theme={"btn--primary-ghost"}
              // items={menuItems}
            />
          </div>
        </div>
      </header>

      {showRefreshConfig && (
        <Modal
          title={"Auto-refresh Config"}
          isOpen={showRefreshConfig}
          applyButtonLabel="Update"
          contentTextAlign={Modal.CONTENT_TEXT_ALIGN.CENTER}
          onClose={() => {
            setShowRefreshConfig(false);
            setConfigType(
              checkTheValueOrReturnDefault(
                localStorage.getItem("dashboard_refresh_type"),
                configItems[0].label
              )
            );
            setConfigValue(
              checkTheValueOrReturnDefault(
                localStorage.getItem("dashboard_refresh_value"),
                5
              )
            );
          }}
          onAction={(data) => {
            if (data === "component-modal-apply-button") {
              localStorage.setItem("dashboard_refresh_type", configType);
              localStorage.setItem("dashboard_refresh_value", configValue);
              localStorage.setItem("enable_refresh", autoRefresh);
              setShowRefreshConfig(false);
              // setRefreshConfig();
            }
          }}
          applyButtonProps={{ disabled: errorMessage }}
        >
          <div style={{ marginLeft: "30%" }}>
            <Switch
              key="ft-switch"
              checked={autoRefresh}
              label="Auto refresh enable"
              onChange={(data) => {
                setAutoRefresh(!autoRefresh);
              }}
            />
          </div>
          <Divider />
          <div>
            Refresh data every
            <p>
              <div className="row">
                <div className="col-3"></div>
                <div className="col-3">
                  <Input
                    type={Input.TYPE.NUMBER}
                    onChange={(e) => {
                      setConfigValue(parseInt(e.target.value));
                    }}
                    value={configValue}
                    disabled={!autoRefresh}
                    help={{
                      message: errorMessage,
                      type: errorMessage
                        ? HelpBlock.TYPE.ERROR
                        : HelpBlock.TYPE.INFO,
                    }}
                  />
                </div>
                <div className="col-3">
                  <Dropdown
                    type={Dropdown.TYPE.BUTTON}
                    size={Button.SIZE.SMALL}
                    label={configType}
                    theme={Dropdown.BUTTON_THEME.PRIMARY_GHOST}
                    menuDirection={Dropdown.MENU_DIRECTION.CENTER}
                    items={configItems}
                    onItemSelected={(data) => {
                      setConfigType(data.label);
                    }}
                    disabled={!autoRefresh}
                  />
                </div>
              </div>
            </p>
          </div>
        </Modal>
      )}

      <div className="row">
        <Card className="col m-10">
          <CardHeader
            content={{
              title: (
                <div style={{ fontWeight: "700" }}>
                  <small>Agents Breakdown By State</small>
                </div>
              ),
            }}
          />
          <CardBody>
            <div className="row">
              <div
                className="col-12"
                style={{ display: "flex", justifyContent: "center" }}
              >
                <Charts.ComposedChart
                  width={1150}
                  height={400}
                  data={chartsData}
                  margin={{
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 20,
                  }}
                  onClick={(data) => {
                    const dateValue = data.activePayload[0].payload.date;
                    const queryParam = `sys_updated_onON${dateValue}@javascript:gs.dateGenerate('${dateValue}','start')@javascript:gs.dateGenerate('${dateValue}','end')`;
                    props.history.push({
                      pathname: pathPrefix + "/home",
                      state: { queryParam },
                    });
                  }}
                >
                  <Charts.CartesianGrid stroke="#f5f5f5" />
                  <Charts.XAxis dataKey="name" />
                  <Charts.YAxis />
                  <Charts.Tooltip />
                  <Charts.Legend wrapperStyle={{ bottom: "-5px" }} />
                  <Charts.Line type="monotone" dataKey="New" stroke="red" />
                  <Charts.Line
                    type="monotone"
                    dataKey="In Progress"
                    stroke="#ff9900"
                  />
                  <Charts.Line
                    type="monotone"
                    dataKey="On Hold"
                    stroke="#8884d8"
                  />
                  <Charts.Line
                    type="monotone"
                    dataKey="Resolved"
                    stroke="#82ca9d"
                  />
                  <Charts.Line
                    type="monotone"
                    dataKey="Closed"
                    stroke="#0e7400"
                  />
                  <Charts.Line
                    type="monotone"
                    dataKey="Canceled"
                    stroke="#ff74ff"
                  />
                </Charts.ComposedChart>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="row">
        <Card className="col m-10">
          <CardHeader
            content={{
              title: (
                <div style={{ fontWeight: "700" }}>
                  <small>Agent Breakdown by Priority</small>
                </div>
              ),
            }}
          />
          <CardBody>
            <div className="row">
              <div className="col-12">
                <Charts.PieChart width={400} height={400}>
                  <Charts.Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={130}
                    fill="#8884d8"
                    dataKey="agents"
                    legendType="square"
                    label={renderCustomizedLabel}
                    isAnimationActive={false}
                    onClick={(data) => {
                      const typeMap = {
                        "Day/s": "days",
                        "Week/s": "week",
                        "Month/s": "months",
                      };
                      const toDate = moment().format("YYYY-MM-DD");
                      const value = localStorage.getItem("config_date_value");
                      const type = localStorage.getItem("config_value");
                      const fromDate = moment()
                        .subtract(
                          checkTheValueOrReturnDefault(value, 15),
                          checkTheValueOrReturnDefault(typeMap[type], "days")
                        )
                        .format("YYYY-MM-DD");
                      const objMap = {
                        "1 - Critical": 1,
                        "2 - High": 2,
                        "3 - Moderate": 3,
                        "4 - Low": 4,
                        "5 - Planning": 5,
                      };
                      const queryParam = `sys_updated_onBETWEENjavascript:gs.dateGenerate('${fromDate}','00:00:00')@javascript:gs.dateGenerate('${toDate}','23:59:59')^priority=${
                        objMap[data.payload.name]
                      }`;
                      props.history.push({
                        pathname: pathPrefix + "/home",
                        state: { queryParam },
                      });
                    }}
                  >
                    {pieChartData.map((entry, index) => (
                      <Charts.Cell
                        key={`cell-${index}`}
                        fill={PIE_CHART_COLORS[entry.name]}
                      />
                    ))}
                  </Charts.Pie>
                  <Charts.Tooltip />
                  <Charts.Legend
                    iconSize={10}
                    width={120}
                    height={140}
                    layout="vertical"
                    verticalAlign="middle"
                    wrapperStyle={style}
                  />
                </Charts.PieChart>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card className="col m-10">
          <CardHeader
            content={{
              title: (
                <div style={{ fontWeight: "700" }}>
                  <small>Open/Closed Agent Summary</small>
                </div>
              ),
            }}
          />
          <CardBody>
            <div className="row">
              <div className="col-12">
                <Charts.ComposedChart
                  width={500}
                  height={400}
                  data={chartsData}
                  margin={{
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 20,
                  }}
                  onClick={(data) => {
                    const dateValue = data.activePayload[0].payload.date;
                    const queryParam = `sys_updated_onON${dateValue}@javascript:gs.dateGenerate('${dateValue}','start')@javascript:gs.dateGenerate('${dateValue}','end')^stateIN1,7`;
                    props.history.push({
                      pathname: pathPrefix + "/home",
                      state: { queryParam },
                    });
                  }}
                >
                  <Charts.CartesianGrid stroke="#f5f5f5" />
                  <Charts.XAxis dataKey="name" />
                  <Charts.YAxis />
                  <Charts.Tooltip />
                  <Charts.Legend wrapperStyle={{ bottom: "-5px" }} />
                  <Charts.Bar dataKey="Open" barSize={20} fill="#FF7300" />
                  <Charts.Bar dataKey="Closed" barSize={10} fill="#14A792" />
                </Charts.ComposedChart>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
