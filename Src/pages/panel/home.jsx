import { connect } from "react-redux";
import Layout from "../../components/control_panel_layout";
import { FETCH_DATA, syncfetchUserInofrmation } from "../../actions/actions";
import { HashLoader } from "react-spinners";
import {
  Container,
  Box,
  Grid,
  Paper,
  Typography,
  Snackbar,
  Chip,
  Fab,
  Tooltip,
} from "@material-ui/core";
import { Alert, Skeleton } from "@material-ui/lab";
import {
  LockRounded,
  LocalHospitalRounded,
  MapRounded,
  SupervisedUserCircleSharp,
  Delete,
  Edit,
} from "@material-ui/icons";
import { colors } from "../../../public/styles.json";
import { makeStyles } from "@material-ui/core/styles";
import { useEffect, useState, Fragment } from "react";
import { useRouter } from "next/router";
import nextCookies from "next-cookies";
import { validAuth } from "../../helpers/auth.ctx";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";

const features = ({ roles, hospitals, govs, users }) => {
  return [
    {
      name: "الصلاحيات",
      icon: LockRounded,
      length: roles.data.length,
      color: colors.warning,
    },
    {
      name: "المحافظات",
      icon: MapRounded,
      length: govs.data.length,
      color: colors.success,
    },
    {
      name: "المستشفيات",
      icon: LocalHospitalRounded,
      length: hospitals.data.length,
      color: colors.info,
    },
    {
      name: "المديرين",
      icon: SupervisedUserCircleSharp,
      length: users.data.length,
      color: colors.danger,
    },
  ];
};

const styles = makeStyles((theme) => {
  return {
    papers: {
      color: "#f8f8f8",
    },
    dateBox: {
      borderBottom: "8px solid " + colors.primary,
      display: "inline-flex",
    },
    activityTable: {
      margin: "0 auto",
      [theme.breakpoints.down("md")]: {
        maxWidth: "100%",
      },
    },
    fabDanger: {
      marginLeft: "0.5rem",
      [theme.breakpoints.down("md")]: {
        marginLeft: "0px",
        marginTop: "0.25rem",
      },
    },
  };
});

const userAssignments = (id, governments, hospitals) => {
  const hospitalsArray =
    hospitals.filter((hos) => hos.created_by === id) || hos.updated_by === id;

  const governmentsArray = governments.filter(
    (hos) => hos.created_by === id || hos.updated_by === id
  );

  return {
    hospitals: {
      data: [...hospitalsArray],
    },
    govs: {
      data: [...governmentsArray],
    },
  };
};

const ItemsSpinners = (props) => {
  const spinerBoxLoaders = [1, 2, 3, 4];
  const Loaderslist = spinerBoxLoaders.map((item, index) => {
    return (
      <Grid item md={3} xs={6} key={index.toString()}>
        <Skeleton variant="rect" style={{ height: "80px" }} />
      </Grid>
    );
  });

  return Loaderslist;
};

const Items = (props) => {
  const Lista = features({ ...props });
  const clases = styles();
  const ItemsList = Lista.map((data, index) => {
    return (
      <Grid item md={3} xs={6} className={clases.papers} key={index.toString()}>
        <Paper elevation={18}>
          <Box display="flex" flexDirection="row">
            <Box
              style={{
                backgroundColor: data.color,
                color: "#f8f8f8",
              }}
              py={3}
              px={2}
            >
              <data.icon fontSize="large" />
            </Box>
            <Box
              flexGrow={2}
              py={3}
              style={{ color: "#000" }}
              textAlign="center"
            >
              <Typography style={{ fontSize: "13px" }}>{data.name}</Typography>
              <Typography style={{ fontSize: "13px" }}>
                {data.length}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>
    );
  });

  return ItemsList;
};

const SnackBarApiError = (props) => {
  return (
    <Box {...props} ref={props.refs}>
      <Snackbar
        color="danger"
        open={props.open}
        onClose={props.onClose}
        anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
      >
        <Alert
          onClose={props.onClose}
          severity="error"
          elevation={3}
          variant="filled"
        >
          {props.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

const TableOfActivity = (props) => {
  const hospitals = props.hospitals;
  const govs = props.govs;

  const clases = styles();
  return (
    <>
      <TableContainer component={Paper} elevation={18}>
        <Table className={clases.activityTable} aria-label="actvity-table">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>الاسم</TableCell>
              <TableCell>النوع</TableCell>
              <TableCell>التاريخ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {govs.map((cell, id) => {
              return (
                <TableRow key={cell.name + id}>
                  <TableCell component="th" scope="row">
                    {cell.id}
                  </TableCell>
                  <TableCell align="left">{cell.name}</TableCell>
                  <TableCell align="left">
                    <Chip
                      label="محافظة"
                      variant="default"
                      style={{
                        backgroundColor: colors.success,
                        color: "#f8f8f8",
                      }}
                    />
                  </TableCell>
                  <TableCell align="left">
                    {new Date(cell.createdAt).toLocaleString("ar")}
                  </TableCell>
                </TableRow>
              );
            })}
            {hospitals.map((cell, id) => {
              return (
                <TableRow key={cell.name + id}>
                  <TableCell component="th" scope="row">
                    {cell.id}
                  </TableCell>
                  <TableCell align="left">{cell.name}</TableCell>
                  <TableCell align="left">
                    <Chip
                      label={"مستشفي"}
                      variant="default"
                      style={{
                        backgroundColor: colors.info,
                        color: "#f8f8f8",
                      }}
                    />
                  </TableCell>
                  <TableCell align="left">
                    {new Date(cell.createdAt).toLocaleString("ar")}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

const Home = (props) => {
  const clases = styles();

  const [snackOpen, setSnackOpen] = useState(false);
  const [userActivity, setUserActivity] = useState(null);

  const router = useRouter();
  useEffect(() => {
    const jwt_token = props.auth_token;
    if (!jwt_token) {
      router.push("/panel/login");
    }
    props.FETCH_DATA(jwt_token);

    if (props.fetch_api_data) {
      setSnackOpen(false);
    }

    if (props.fetch_api_data.govs && props.fetch_api_data.hospitals) {
      if (
        props.fetch_api_data.govs.data &&
        props.fetch_api_data.hospitals.data
      ) {
        const assign = userAssignments(
          props.id,
          props.fetch_api_data.govs.data,
          props.fetch_api_data.hospitals.data
        );
        setUserActivity(assign);
      }
    }
  }, [props.fetch_api_data_isLoading]);

  useEffect(() => {
    if (props.fetch_api_data_error) {
      setSnackOpen(true);
    }
  }, [props.fetch_api_data_error]);

  useEffect(() => {
    if (props.id) {
      props.fetchAuthUser(props.auth_token, props.id);
    }
  }, [props.id]);

  if (!props.auth_token) {
    return (
      <Box
        position="fixed"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.69)",
          width: "100vw",
          height: "100vh",
          top: "0",
        }}
      >
        <Box
          position="absolute"
          style={{
            left: "50vw",
            top: "40vh",
          }}
        >
          <HashLoader size={60} color={colors.info} />
        </Box>
      </Box>
    );
  }
  return (
    <Layout>
      <Container>
        <Box>
          <Box mt={4}>
            <Grid container justify="center" spacing={3}>
              {props.fetch_api_data_isLoading ? (
                <ItemsSpinners />
              ) : (
                <Items
                  roles={props.fetch_api_data.roles}
                  users={props.fetch_api_data.users}
                  govs={props.fetch_api_data.govs}
                  hospitals={props.fetch_api_data.hospitals}
                />
              )}
            </Grid>
          </Box>

          <Box mt={4}>
            <Typography variant="h4" align="center">
              مساهامتك
            </Typography>
            <Grid item  md={8} xs={11} style={{ margin: "0 auto" }}>
              <Box py={2}>
                {userActivity ? (
                  <TableOfActivity
                    govs={userActivity.govs.data}
                    hospitals={userActivity.hospitals.data}
                  />
                ) : (
                  <Skeleton variant="rect" height="150px" />
                )}
              </Box>
            </Grid>
          </Box>

          {props.fetch_api_data_error ? (
            <SnackBarApiError
              msg={props.fetch_api_data_error}
              onClose={() => setSnackOpen(false)}
              open={snackOpen}
            />
          ) : (
            ""
          )}
        </Box>
      </Container>
    </Layout>
  );
};

Home.getInitialProps = async (ctx) => {
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

const MapStateToProps = (state) => {
  return { ...state };
};

const MapDispatchToProps = (dispatch) => {
  return {
    FETCH_DATA: (jwt_token) => dispatch(FETCH_DATA({ jwt_token })),
    fetchAuthUser: (jwt, id) => dispatch(syncfetchUserInofrmation(jwt, id)),
  };
};

export default connect(MapStateToProps, MapDispatchToProps)(Home);
