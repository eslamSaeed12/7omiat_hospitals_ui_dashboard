import roleClient from "../../helpers/role.client";
import { useForm } from "react-hook-form";
import { useState, useEffect, forwardRef } from "react";
import { Box, Container, Typography, Grid } from "@material-ui/core";
import PageLoader from "../../components/PageLoader";
import { colors } from "../../../public/styles.json";
import Layout from "../../components/control_panel_layout";
import CDialog from "../../components/ErrorsDialog";
import { connect } from "react-redux";
import nextCookies from "next-cookies";
import { validAuth } from "../../helpers/auth.ctx";
import { syncfetchUserInofrmation } from "../../actions/actions";
import RolesImageBackground from "../../../public/images/roles_background.svg";
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
      width: "20%",
    },
  };
});

const roleCreateSchema = yup.object().shape({
  title: yup.string().min(4).max(18).required(),
});

const rolePage = (props) => {
  // loader
  const [loading, setLoading] = useState(true);
  const clases = styles();

  const [roleLoad, setRolesLoad] = useState(true);
  const [rolesErorrs, setRolesErrors] = useState([]);
  const [state, setState] = useState({
    columns: [
      { title: "#", field: "id", readOnly: true },
      { title: "الاسم", field: "title" },
      { title: "الانشاء", field: "createdAt", readOnly: true },
      { title: "التجديد", field: "updatedAt", readOnly: true },
    ],
    data: [],
  });
  // component did mount
  useEffect(() => {
    setLoading(false);
    console.log(props);
  }, []);
  useEffect(() => {
    props.fetchAuthUser(props.auth_token, props.id);
    let roler = roleClient(props.auth_token);

    const getAllRoles = async () => {
      const roles = await roler.findAll();
      setState((previous) => {
        const endata = [...roles.data];
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
      setRolesLoad(false);
    };
    //setRolesErrors(["err num 1 ", "err num2", "err num3"]);
    getAllRoles().catch((e) => console.log(e));
  }, [props.id]);

  if (loading) {
    return <PageLoader color={colors.info} />;
  }

  return (
    <Layout>
      <Box>
        <Container>
          <Box textAlign="center">
            <Typography variant="h4">الصلاحيات</Typography>
            <img src={RolesImageBackground} className={clases.svgBackground} />
          </Box>
          <MaterialTable
            isLoading={roleLoad}
            localization={{ header: { actions: "ادارة" } }}
            icons={tableIcons}
            title="ادارة الصلاحيات"
            columns={state.columns}
            data={state.data}
            editable={{
              onRowAdd: (newData) => {
                return new Promise((resolve, reject) => {
                  roleCreateSchema
                    .validate({ ...newData })
                    .then((e) => {
                      // validate the server there
                      roleClient(props.auth_token)
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
                            setRolesErrors(err.response.data.errors);
                          } else {
                            setRolesErrors([err.message]);
                          }
                        });
                    })
                    .catch((e) => {
                      // yup errors
                      reject();
                      setRolesErrors(e.errors);
                    });
                });
                //data[data.indexOf(oldData)] = newData;
              },
              onRowUpdate: (newData, oldData) => {
                return new Promise((resolve, reject) => {
                  if (oldData) {
                    roleCreateSchema
                      .validate({ title: newData.title })
                      .then((e) => {
                        // validate the server there
                        roleClient(props.auth_token)
                          .update({ ...e, id: oldData.id })
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
                              setRolesErrors(err.response.data.errors);
                            } else {
                              setRolesErrors([err.message]);
                            }
                          });
                      })
                      .catch((e) => {
                        reject();
                        setRolesErrors(e.errors);
                      });
                  }
                });
              },
              onRowDelete: (oldData) => {
                return new Promise((resolve, reject) => {
                  if (oldData) {
                    if (!Number.isInteger(oldData.id)) {
                      reject();
                      setRolesErrors(["id is not a number"]);
                    }
                    roleClient(props.auth_token)
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
                        setRolesErrors([err.message]);
                        reject();
                      });
                  }
                });
              },
            }}
          />
        </Container>
        {rolesErorrs.length ? (
          <CDialog
            onClose={() => setRolesErrors([])}
            errs={rolesErorrs}
            open={Boolean(rolesErorrs.length)}
            errTitle="خطأ في عملية التصحيح"
          />
        ) : (
          ""
        )}
      </Box>
    </Layout>
  );
};

rolePage.getInitialProps = async (ctx) => {
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
export default connect((state) => state, mapDispatchToProps)(rolePage);
