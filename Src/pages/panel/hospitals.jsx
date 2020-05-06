import hospitalsClient from "../../helpers/hospitals.client";
import govsClient from "../../helpers/govs.client";
import userClient from "../../helpers/user.client";
import Dynamic from "next/dynamic";
import { style as layerStyle } from "../../configs/layer.style";
import { useState, useEffect, forwardRef } from "react";
import { Box, Container, Typography } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import PageLoader from "../../components/PageLoader";
import { colors } from "../../../public/styles.json";
import Layout from "../../components/control_panel_layout";
import utils from "../../helpers/map.utils";
import CDialog from "../../components/ErrorsDialog";
import { connect } from "react-redux";
import nextCookies from "next-cookies";
import { validAuth } from "../../helpers/auth.ctx";
import { syncfetchUserInofrmation } from "../../actions/actions";
import UsersImageBackground from "../../../public/images/hospitals.svg";
import { makeStyles } from "@material-ui/core/styles";
import MaterialTable from "material-table";
import * as yup from "yup";
import AddBox from "@material-ui/icons/AddBox";
import ArrowDownward from "@material-ui/icons/ArrowDownward";
import Check from "@material-ui/icons/Check";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import Clear from "@material-ui/icons/Clear";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import Edit from "@material-ui/icons/Edit";
import FilterList from "@material-ui/icons/FilterList";
import FirstPage from "@material-ui/icons/FirstPage";
import LastPage from "@material-ui/icons/LastPage";
import Remove from "@material-ui/icons/Remove";
import SaveAlt from "@material-ui/icons/SaveAlt";
import Search from "@material-ui/icons/Search";
import ViewColumn from "@material-ui/icons/ViewColumn";
const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => (
    <ChevronRight {...props} ref={ref} />
  )),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => (
    <ChevronLeft {...props} ref={ref} />
  )),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
};
// here styling
const styles = makeStyles((theme) => {
  return {
    svgBackground: {
      width: "50vw",
    },
  };
});

const MapBoxComponent = Dynamic(
  () => import("../../components/locations.map"),
  { ssr: false }
);

const hospitalsCreateSchema = yup.object().shape({
  name: yup.string().required().min(6).max(255),
  telephone: yup.string().length(9).required(),
  fullDescription: yup.string().required().max(255).min(8),
  coords: yup.object({
    type: yup.string().max("5"),
    coordinates: yup.array(yup.number(), yup.number()),
  }),
  gov_id: yup.number().integer().required(),
});

//array([yup.number(),yup.number()])

const hospitalsPage = (props) => {
  // loader
  const [loading, setLoading] = useState(true);
  const clases = styles();
  const [hospitalsLoad, setHospitalsLoad] = useState(true);
  const [hospitalsErrors, setHospitalsErrors] = useState([]);
  const [lookup, setLookup] = useState(false);
  const [state, setState] = useState({});
  const [usersLookup, setUsersLookup] = useState(false);
  const [users, setUsers] = useState([]);
  const [points, setPoints] = useState([]);
  // component did mount
  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    props.fetchAuthUser(props.auth_token, props.id);

    const GovsResolver = govsClient(props.auth_token);

    const allGovs = GovsResolver.findAll();

    const allUsers = userClient(props.auth_token).findAll();

    const getAllHospitals = async (users_) => {
      const hossReslover = hospitalsClient(props.auth_token);
      const hospitals = await hossReslover.findAll();
      /* 

  */
      setState((previous) => {
        const endata = [...hospitals.data];
        const localizedData = endata.map((cell) => {
          return {
            ...cell,
            createdAt: new Date(cell.createdAt).toLocaleString("ar"),
            coords: cell.coords.coordinates,
            updated_by: "",
          };
        });
        const data = localizedData;
        return { ...previous, data };
      });
      const flated = utils().flattenCoords(hospitals.data);
      const geoJsonPoints = utils().parseGeoJson(flated);
      setPoints(geoJsonPoints);
      setHospitalsLoad(false);
    };

    allGovs
      .then((e) => {
        allUsers
          .then((usrs) => {
            const lookupList = () => {
              const lookup = {};
              e.data.forEach((one) => {
                lookup[one.id] = one.name;
              });

              return lookup;
            };

            const usersLookUpList = () => {
              const lookup = {};
              usrs.data.forEach((one) => {
                lookup[one.id] = one.username;
              });

              return lookup;
            };

            setState({
              columns: [
                { title: "#", field: "id", readOnly: true, hidden: true },
                { title: "الاسم", field: "name" },
                { title: "التليفون", field: "telephone" },
                { title: "العنوان", field: "fullDescription" },
                {
                  title: "الاحداثيات",
                  field: "coords",
                },
                { title: "المحافظة", field: "gov_id", lookup: lookupList() },
                { title: "انشاء", field: "createdAt" },
                {
                  title: "بواسطة",
                  field: "created_by",
                  lookup: usersLookUpList(),
                  readOnly: true,
                },
                {
                  title: "تجديد",
                  field: "updated_by",
                  lookup: usersLookUpList(),
                },
              ],
              data: [],
            });
            setLookup(true);
            setUsers(usrs.data);
            setUsersLookup(true);
            getAllHospitals(usrs.data).catch((e) =>
              setHospitalsErrors([e.message])
            );
          })
          .catch((usrsErr) => {
            if (usrsErr.response) {
              setHospitalsErrors([...usrsErr.response.data.errors]);
            }
            setHospitalsErrors([usrsErr.message]);
          });
      })
      .catch((e) => {
        if (e.response) {
          setHospitalsErrors([...e.response.data.errors]);
        }
        setHospitalsErrors([e.message]);
      });
  }, [props.auth_token, props.id]);

  if (loading) {
    return <PageLoader color={colors.info} />;
  }

  return (
    <Layout>
      <Box>
        <Container>
          <Box textAlign="center" mb={4}>
            <Typography variant="h4">المستشفيات</Typography>
            <img
              src={UsersImageBackground}
              className={"ROLES-BACKGROUND-IMAGE"}
            />
          </Box>
          {lookup && usersLookup ? (
            <MaterialTable
              isLoading={hospitalsLoad}
              localization={{ header: { actions: "ادارة" } }}
              icons={tableIcons}
              title="ادرة المستشفيات"
              columns={state.columns}
              data={state.data}
              style={{
                boxShadow:
                  "0px 9px 11px -5px rgba(0,0,0,0.2), 0px 18px 28px 2px rgba(0,0,0,0.14), 0px 7px 34px 6px rgba(0,0,0,0.12)",
              }}
              editable={{
                onRowAdd: (newData) => {
                  return new Promise((resolve, reject) => {
                    console.log(newData);
                    const coords = newData.coords.split(",");
                    hospitalsCreateSchema
                      .validate({
                        ...newData,
                        coords: {
                          type: "Point",
                          coordinates: [...coords],
                        },
                      })
                      .then((e) => {
                        // validate the server there
                        console.log(e);
                        hospitalsClient(props.auth_token)
                          .create({ ...e, created_by: props.id })
                          .then((savedData) => {
                            // role is valid
                            console.log(savedData);
                            setState((prevstate) => {
                              const data = [...prevstate.data];
                              data.push({
                                ...savedData.data.data,
                                createdAt: new Date(
                                  savedData.data.data.createdAt
                                ).toLocaleString("ar"),
                                coords: savedData.data.data.coords.coordinates,
                              });
                              return { ...prevstate, data };
                            });
                            resolve();
                          })
                          .catch((err) => {
                            // server validation errors
                            if (err.response) {
                              setHospitalsErrors(
                                err.response.data.errors || [
                                  "internal server error",
                                ]
                              );
                            } else {
                              setHospitalsErrors(
                                [err.message] || ["internal server error"]
                              );
                            }
                            reject();
                          });
                      })
                      .catch((e) => {
                        // yup errors
                        reject();
                        setHospitalsErrors(
                          e.errors || ["internal server error"]
                        );
                      });
                  });
                },
                onRowUpdate: (newData, oldData) => {
                  return new Promise((resolve, reject) => {
                    hospitalsCreateSchema
                      .validate({
                        ...newData,
                        coords: {
                          type: "Point",
                          coordinates: newData.coords.split(",") || [],
                        },
                      })
                      .then((e) => {
                        // ajax send
                        hospitalsClient(props.auth_token)
                          .update({
                            ...e,
                            updated_by: props.id,
                          })
                          .then((savedData) => {
                            // update table state here
                            setState((prev) => {
                              const lastData = [...prev.data];
                              lastData[lastData.indexOf(oldData)] = {
                                ...savedData.data.data,
                                createdAt: new Date(
                                  savedData.data.data.createdAt
                                ).toLocaleString("ar"),
                                coords: savedData.data.data.coords.coordinates,
                              };

                              return { ...prev, data: [...lastData] };
                            });
                            resolve();
                          })
                          .catch((clientErr) => {
                            let mapObjectErrsToArray = [];
                            if (
                              clientErr.response &&
                              clientErr.response.data &&
                              clientErr.response.data.errors
                            ) {
                              mapObjectErrsToArray = clientErr.response.data.errors.map(
                                (err) => {
                                  return err.message;
                                }
                              );
                              setHospitalsErrors([...mapObjectErrsToArray]);
                            } else {
                              setHospitalsErrors(
                                clientErr.response.data.error || [
                                    e.message,
                                  ] || ["internal server error"]
                              );
                            }
                            reject();
                          });
                      })
                      .catch((err) => {
                        console.log();
                        setHospitalsErrors(
                          err.errors || err.message || ["internal server error"]
                        );
                        reject();
                        // catch validate errors
                      });
                  });
                },
                onRowDelete: (oldData) => {
                  return new Promise((resolve, reject) => {
                    if (oldData) {
                      hospitalsClient(props.auth_token)
                        .delete({ id: oldData.id })
                        .then((e) => {
                          setState((prevstate) => {
                            const data = [...prevstate.data];
                            data.splice(data.indexOf(oldData), 1);
                            return { ...prevstate, data };
                          });
                          resolve();
                        })
                        .catch((err) => {
                          setHospitalsErrors(
                            [...err.response.data.error] || [
                                ...err.response.data.errors,
                              ] || [err.message],
                            ["internal server error"]
                          );
                          reject();
                        });
                    }
                  });
                },
              }}
            />
          ) : (
            <Skeleton variant="rect" height="280px" />
          )}
          <Box mt={3}>
            <Typography variant="h5" align="center">
              تصفح المستشفيات
            </Typography>
            <Box overflow="hidden" mt={3}>
              {state && state.data ? (
                <MapBoxComponent
                  token={props.mapboxToken}
                  data={points}
                  layerStyle={layerStyle}
                />
              ) : (
                <Skeleton variant="rect" height="400px" />
              )}
            </Box>
          </Box>
        </Container>
        {hospitalsErrors.length ? (
          <CDialog
            onClose={() => setHospitalsErrors([])}
            errs={hospitalsErrors}
            open={Boolean(hospitalsErrors.length)}
            errTitle="خطأ في عملية التصحيح"
          />
        ) : (
          ""
        )}
      </Box>
    </Layout>
  );
};

hospitalsPage.getInitialProps = async (ctx) => {
  try {
    await validAuth({ ctx });

    const cookiesLoader = nextCookies(ctx);
    const jwtCookie = cookiesLoader["META-AUTH-TOKEN"];
    const jwtDecoderPlugin = require("jwt-decode");

    let jwtDecoded;
    if (jwtCookie) {
      jwtDecoded = jwtDecoderPlugin(jwtCookie);
    }
    return {
      auth_token: jwtCookie,
      mapboxToken: process.env.mapboxToken,
      id: jwtDecoded ? jwtDecoded.id : null,
    };
  } catch (e) {
    console.log(e);
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchAuthUser: (jwt, id) => dispatch(syncfetchUserInofrmation(jwt, id)),
  };
};
export default connect((state) => state, mapDispatchToProps)(hospitalsPage);
