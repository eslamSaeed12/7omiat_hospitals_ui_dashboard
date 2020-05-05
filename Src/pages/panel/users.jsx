import userClient from "../../helpers/user.client";
import roleClient from "../../helpers/role.client";
import { useState, useEffect, forwardRef } from "react";
import { Box, Container, Typography } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import PageLoader from "../../components/PageLoader";
import { colors } from "../../../public/styles.json";
import Layout from "../../components/control_panel_layout";
import V from "validator";
import CDialog from "../../components/ErrorsDialog";
import { connect } from "react-redux";
import nextCookies from "next-cookies";
import { validAuth } from "../../helpers/auth.ctx";
import { syncfetchUserInofrmation } from "../../actions/actions";
import UsersImageBackground from "../../../public/images/users_background.svg";
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
import govsClient from "../../helpers/govs.client";
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
      width: "10%",
    },
  };
});

const usersCreateSchema = yup.object().shape({
  username: yup.string().min(4).max(18).required(),
  email: yup.string().email().required().max(255),
  password: yup.string().required().min(8).max(18),
  role_id: yup.number().integer().required(),
});

const userUpdateSchema = yup.object().shape({
  username: yup.string().min(4).max(18).required(),
  email: yup.string().email().required().max(255),
  role_id: yup.number().integer().required(),
  password: yup.string().required().length(64),
});

const usersPage = (props) => {
  // loader
  const [loading, setLoading] = useState(true);
  const clases = styles();
  const [usersLoad, setUsersLoad] = useState(true);
  const [usersErorrs, setUsersErrors] = useState([]);
  const [lookup, setLookup] = useState(false);
  const [state, setState] = useState({});
  // component did mount
  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    props.fetchAuthUser(props.auth_token, props.id);

    const roleReslover = roleClient(props.auth_token);

    const allRoles = roleReslover.findAll();

    allRoles
      .then((e) => {
        const lookupList = () => {
          const lookup = {};
          e.data.forEach((one) => {
            lookup[one.id] = one.title;
          });

          return lookup;
        };

        setState({
          columns: [
            { title: "#", field: "id", readOnly: true, hidden: true },
            { title: "الاسم", field: "username" },
            { title: "الايميل", field: "email" },
            { field: "password", hidden: true },
            {
              title: "الصلاحيه",
              field: "role_id",
              lookup: lookupList(),
              // initialEditValue: props.auth_user.role.id,
            },
            { title: "الباسورد", field: "new_password" },
            { title: "انشاء", field: "createdAt" },
            { title: "تحديث", field: "updatedAt" },
          ],
          data: [],
        });
        setLookup(true);
      })
      .catch((e) => {
        if (e.response) {
          setUsersErrors([...e.response.data.errors]);
        }
        setUsersErrors([e.message]);
      });

    const getAllUsers = async () => {
        
      const usersResolver = userClient(props.auth_token);

      const users = await usersResolver.findAll();

      setState((previous) => {
        const endata = [...users.data];
        const localizedData = endata.map((cell) => {
          return {
            ...cell,
            createdAt: new Date(cell.createdAt).toLocaleString("ar"),
            updatedAt: new Date(cell.updatedAt).toLocaleString("ar"),
          };
        });
        const data = localizedData;
        return { ...previous, data };
      });
      setUsersLoad(false);
    };
    getAllUsers().catch((e) => setGovsErrors([e.message]));
  }, [props.auth_token, props.id]);

  if (loading) {
    return <PageLoader color={colors.info} />;
  }

  return (
    <Layout>
      <Box>
        <Container>
          <Box textAlign="center">
            <Typography variant="h4">المشرفين</Typography>
            <img src={UsersImageBackground} className={clases.svgBackground} />
          </Box>
          {lookup ? (
            <MaterialTable
              isLoading={usersLoad}
              localization={{ header: { actions: "ادارة" } }}
              icons={tableIcons}
              title="ادارة المشرفين"
              columns={state.columns}
              data={state.data}
              editable={{
                onRowAdd: (newData) => {
                  return new Promise((resolve, reject) => {
                    usersCreateSchema
                      .validate({ ...newData, password: newData.new_password })
                      .then((e) => {
                        // validate the server there
                        console.log(e);
                        userClient(props.auth_token)
                          .create({ ...e })
                          .then((savedData) => {
                            // role is valid
                            setState((prevstate) => {
                              const data = [...prevstate.data];
                              data.push({
                                ...savedData.data.data,
                                createdAt: new Date(
                                  savedData.data.data.createdAt
                                ).toLocaleString("ar"),
                                updatedAt: new Date(
                                  savedData.data.data.updatedAt
                                ).toLocaleString("ar"),
                              });
                              return { ...prevstate, data };
                            });
                            resolve();
                          })
                          .catch((err) => {
                            // server validation errors
                            reject();
                            if (err.response) {
                              setUsersErrors(err.response.data.errors);
                            } else {
                              setUsersErrors([err.message]);
                            }
                          });
                      })
                      .catch((e) => {
                        // yup errors
                        reject();
                        setUsersErrors(e.errors);
                      });
                  });
                },
                onRowUpdate: (newData, oldData) => {
                  return new Promise((resolve, reject) => {
                    if (oldData) {
                      if (newData.new_password) {
                        usersCreateSchema
                          .validate({
                            ...newData,
                            password: newData.new_password,
                          })
                          .then((e) => {
                            // validate the server there
                            userClient(props.auth_token)
                              .update({
                                ...e,
                                id: oldData.id,
                              })
                              .then((savedData) => {
                                // role is valid
                                setState((prevstate) => {
                                  const data = [...prevstate.data];

                                  const updatedOne = {
                                    ...savedData.data.data,
                                    createdAt: new Date(
                                      savedData.data.data.createdAt
                                    ).toLocaleString("ar"),
                                    updatedAt: new Date(
                                      savedData.data.data.updatedAt
                                    ).toLocaleString("ar"),
                                  };

                                  data[data.indexOf(oldData)] = updatedOne;

                                  return { ...prevstate, data };
                                });
                                resolve();
                              })
                              .catch((err) => {
                                // server validation errors
                                reject();
                                if (err.response) {
                                  setUsersErrors(err.response.data.errors);
                                } else {
                                  setUsersErrors([err.message]);
                                }
                              });
                          })
                          .catch((e) => {
                            reject();
                            setUsersErrors(e.errors);
                          });
                      }
                    }
                    if (!newData.new_password) {
                      userUpdateSchema
                        .validate({ ...newData, password: newData.password })
                        .then((e) => {
                          console.log(e);
                          // validate the server there
                          userClient(props.auth_token)
                            .update({
                              ...e,
                            })
                            .then((savedData) => {
                              // role is valid
                              console.log(savedData);
                              setState((prevstate) => {
                                const data = [...prevstate.data];

                                const updatedOne = {
                                  ...savedData.data.data,
                                  createdAt: new Date(
                                    savedData.data.data.createdAt
                                  ).toLocaleString("ar"),
                                  updatedAt: new Date(
                                    savedData.data.data.updatedAt
                                  ).toLocaleString("ar"),
                                };

                                data[data.indexOf(oldData)] = updatedOne;

                                return { ...prevstate, data };
                              });
                              resolve();
                            })
                            .catch((err) => {
                              // server validation errors
                              reject();
                              if (err.response) {
                                setUsersErrors(err.response.data.errors);
                              } else {
                                setUsersErrors([err.message]);
                              }
                            });
                        })
                        .catch((e) => {
                          reject();
                          setUsersErrors(e.errors);
                        });
                    }
                  });
                },
                onRowDelete: (oldData) => {
                  return new Promise((resolve, reject) => {
                    if (oldData) {
                      if (!V.isUUID(oldData.id)) {
                        reject();
                        setUsersErrors(["id is not a number"]);
                      }
                      userClient(props.auth_token)
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
                          setUsersErrors([err.message]);
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
        </Container>
        {usersErorrs.length ? (
          <CDialog
            onClose={() => setUsersErrors([])}
            errs={usersErorrs}
            open={Boolean(usersErorrs.length)}
            errTitle="خطأ في عملية التصحيح"
          />
        ) : (
          ""
        )}
      </Box>
    </Layout>
  );
};

usersPage.getInitialProps = async (ctx) => {
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
export default connect((state) => state, mapDispatchToProps)(usersPage);
