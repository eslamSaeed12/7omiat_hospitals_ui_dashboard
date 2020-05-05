import govClient from "../../helpers/govs.client";
import userClient from "../../helpers/user.client";
import { useForm } from "react-hook-form";
import { useState, useEffect, forwardRef } from "react";
import { Box, Container, Typography, Grid } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import PageLoader from "../../components/PageLoader";
import { colors } from "../../../public/styles.json";
import Layout from "../../components/control_panel_layout";
import CDialog from "../../components/ErrorsDialog";
import { connect } from "react-redux";
import nextCookies from "next-cookies";
import { validAuth } from "../../helpers/auth.ctx";
import { syncfetchUserInofrmation } from "../../actions/actions";
import GovsImageBackground from "../../../public/images/govs_background.svg";
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

const govsCreateSchema = yup.object().shape({
  name: yup.string().min(6).max(18).required(),
  created_by: yup.string().length(36).required(),
  updated_by: yup.string().length(36).nullable(),
});
const govsPage = (props) => {
  // loader
  const [loading, setLoading] = useState(true);
  const clases = styles();
  const [govsLoad, setGovsLoad] = useState(true);
  const [govsErorrs, setGovsErrors] = useState([]);
  const [lookup, setLookup] = useState(false);
  const [state, setState] = useState({});
  // component did mount
  useEffect(() => {
    setLoading(false);
  }, []);
  useEffect(() => {
    props.fetchAuthUser(props.auth_token, props.id);
    let gover = govClient(props.auth_token);
    const userResolver = userClient(props.auth_token);
    const allUsers = userResolver.findAll();

    allUsers
      .then((e) => {
        const lookupList = () => {
          const lookup = {};
          e.data.forEach((one) => {
            lookup[one.id] = one.username;
          });

          return lookup;
        };

        setState({
          columns: [
            { title: "#", field: "id", readOnly: true },
            { title: "الاسم", field: "name" },
            { title: "الانشاء", field: "createdAt", readOnly: true },
            { title: "التجديد", field: "updatedAt", readOnly: true },
            {
              title: "بواسطة",
              field: "created_by",
              lookup: lookupList(),
              initialEditValue: props.id,
              disabled: true,
            },
            {
              title: "جدد",
              field: "updated_by",
              lookup: lookupList(),
              readOnly: true,
            },
          ],
          data: [],
        });
        setLookup(true);
      })
      .catch((e) => {
        if (e.response) {
          setGovsErrors([...e.response.data.errors]);
        }
        setGovsErrors([e.message]);
      });

    const getAllGovs = async () => {
      const govs = await gover.findAll();

      setState((previous) => {
        const endata = [...govs.data];
        const localizedData = endata.map((cell) => {
          return {
            ...cell,
            createdAt: new Date(cell.createdAt).toLocaleString("ar"),
            updatedAt: new Date(cell.updatedAt).toLocaleString("ar"),
            created_by: cell.created_by,
          };
        });
        const data = localizedData;
        return { ...previous, data };
      });
      setGovsLoad(false);
    };
    getAllGovs().catch((e) => setGovsErrors([e.message]));
  }, [props.id]);

  if (loading) {
    return <PageLoader color={colors.info} />;
  }

  return (
    <Layout>
      <Box>
        <Container>
          <Box textAlign="center">
            <Typography variant="h4">المحافظات</Typography>
            <img src={GovsImageBackground} className={clases.svgBackground} />
          </Box>
          {lookup ? (
            <MaterialTable
              isLoading={govsLoad}
              localization={{ header: { actions: "ادارة" } }}
              icons={tableIcons}
              title="ادارة المحافظات"
              columns={state.columns}
              data={state.data}
              editable={{
                onRowAdd: (newData) => {
                  return new Promise((resolve, reject) => {
                    govsCreateSchema
                      .validate({ ...newData })
                      .then((e) => {
                        // validate the server there
                        govsClient(props.auth_token)
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
                              setGovsErrors(err.response.data.errors);
                            } else {
                              setGovsErrors([err.message]);
                            }
                          });
                      })
                      .catch((e) => {
                        // yup errors
                        reject();
                        setGovsErrors(e.errors);
                      });
                  });
                  //data[data.indexOf(oldData)] = newData;
                },
                onRowUpdate: (newData, oldData) => {
                  return new Promise((resolve, reject) => {
                    if (oldData) {
                      govsCreateSchema
                        .validate({ ...newData })
                        .then((e) => {
                          // validate the server there
                          govsClient(props.auth_token)
                            .update({
                              ...e,
                              id: oldData.id,
                              updated_by: props.id,
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
                                setGovsErrors(err.response.data.errors);
                              } else {
                                setGovsErrors([err.message]);
                              }
                            });
                        })
                        .catch((e) => {
                          reject();
                          setGovsErrors(e.errors);
                        });
                    }
                  });
                },
                onRowDelete: (oldData) => {
                  return new Promise((resolve, reject) => {
                    if (oldData) {
                      if (!Number.isInteger(oldData.id)) {
                        reject();
                        setGovsErrors(["id is not a number"]);
                      }
                      govsClient(props.auth_token)
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
                          setGovsErrors([err.message]);
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
        {govsErorrs.length ? (
          <CDialog
            onClose={() => setGovsErrors([])}
            errs={govsErorrs}
            open={Boolean(govsErorrs.length)}
            errTitle="خطأ في عملية التصحيح"
          />
        ) : (
          ""
        )}
      </Box>
    </Layout>
  );
};

govsPage.getInitialProps = async (ctx) => {
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
export default connect((state) => state, mapDispatchToProps)(govsPage);
