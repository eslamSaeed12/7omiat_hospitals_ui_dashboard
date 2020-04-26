import { HashLoader } from "react-spinners";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { loadCSS } from "fg-loadcss";
import { useRouter } from "next/router";
import auth from "../../helpers/auth.class";
import cookie from "js-cookie";
import { connect } from "react-redux";
import nextCookies from "next-cookies";

import {
  Box,
  Grid,
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  Button,
  Tooltip,
  Snackbar,
} from "@material-ui/core";
import {
  LocalHospitalRounded,
  PhoneRounded,
  InfoRounded,
  MapRounded,
  Facebook,
  GitHub,
  Email,
} from "@material-ui/icons";
import { Alert } from "@material-ui/lab";
import Icon from "@material-ui/core/icon";
import { makeStyles } from "@material-ui/styles";
import { colors } from "../../../public/styles.json";

const styles = makeStyles((theme) => {
  return {
    gridLeft: {
      backgroundColor: colors.primary,
      height: "inherit",
      color: "#f8f8f8",
    },
    root: {
      height: "inherit",
    },
    listVertical: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
    },
    listItem: {
      width: "auto",
    },
    responsiveTypo: {
      textAlign: "left",
      [theme.breakpoints.down("sm")]: {
        textAlign: "center",
      },
    },
    ma3lomaHead: {
      marginBottom: theme.spacing(2),
    },
  };
});

const AlertComponent = (props) => {
  return (
    <Box {...props} ref={props.refs}>
      <Snackbar
        color="danger"
        autoHideDuration={6000}
        open={props.open}
        onClose={props.onClose}
        anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
      >
        <Alert
          onClose={props.onClose}
          severity="error"
          elevation={6}
          variant="filled"
        >
          {props.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

const LoaderSpinner = (props) => {
  return (
    <Box
      position="fixed"
      style={{
        backgroundColor: "#f8f8f8",
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
};

const Login = (props) => {
  // state

  const { handleSubmit, errors, control } = useForm();

  const [loading, isLoading] = React.useState(true);

  const [signInError, setSignInErorr] = React.useState(null);

  const [open, setopen] = React.useState(false);

  const [authenticated, setAuthenticated] = React.useState(false);

  const router = useRouter();

  const snackRef = React.useRef();

  // state

  React.useEffect(() => {
    loadCSS(
      "https://use.fontawesome.com/releases/v5.12.0/css/all.css",
      document.querySelector("#font-awesome-css")
    );
    if (props.auth_token) {
      router.push("/panel/home");
    }

    if (!props.auth_token) {
      isLoading(false);
    }
  }, []);

  const [authLoad, setAuthLoad] = React.useState(false);

  // show notfication logic

  const onsubmit = async (data) => {
    setAuthLoad(true);

    if (snackRef) {
      setopen(false);
    }

    const { email, password } = data;

    const jwt = await auth.login({
      email,
      password,
    });

    if (jwt) {
      setAuthLoad(false);
      props.dispatch({
        type: "AUTHENTICATION_LOGIN",
        payload: await jwt.data.token,
      });
    }

    // handle if no user
    if (jwt.error) {
      // show a notfication for the error
      setSignInErorr(jwt.error);
      setopen(true);
    }

    if (!jwt.error) {
      // here if no errors it sould save the user token and redirect to the home panel
      const token = await jwt.data.token;

      cookie.set("META-AUTH-TOKEN", token);

      router.push("/panel/home");
    }
  };

  const clases = styles();

  if (loading) {
    return (
      <Box
        position="absolute"
        style={{
          left: "50vw",
          top: "40vh",
        }}
      >
        <HashLoader size={60} color={colors.info} />
        <Typography
          align="center"
          style={{
            margin: "15px -15px",
            color: "#4b4b4b",
          }}
        >
          جاري التحميل
        </Typography>
      </Box>
    );
  }
  return (
    <Box height="100vh">
      <Grid container className={clases.root}>
        <Grid item md={8} sm={6} xs={12}>
          <Box
            py={4}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100vh"
          >
            <Box mb={5}>
              <Typography variant="h4"> تسجيل دخول </Typography>
            </Box>
            <form onSubmit={handleSubmit(onsubmit)}>
              <Box display="flex" flexDirection="column">
                <Controller
                  as={<TextField />}
                  type="email"
                  placeholder="البريد الالكتروني"
                  name="email"
                  defaultValue=""
                  rules={{
                    required: "يجب ادخال البريد الالكتروني",
                  }}
                  control={control}
                  error={Boolean(errors.email)}
                />
                <Typography
                  style={{
                    color: colors.danger,
                  }}
                  variant="caption"
                >
                  {errors.email ? errors.email.message : ""}
                </Typography>
              </Box>
              <Box my={3} display="flex" flexDirection="column">
                <Controller
                  as={<TextField />}
                  type="password"
                  placeholder="الرقم السري"
                  defaultValue=""
                  name="password"
                  rules={{
                    required: "يجب ادخال الرقم السري",
                    minLength: {
                      value: 8,
                      message: "الرقم السري لا يقل عن 8 رموز",
                    },
                    maxLength: {
                      value: 18,
                      message: "الرقم السري لا يزيد عن 18 رمز",
                    },
                  }}
                  control={control}
                  error={Boolean(errors.password)}
                />
                <Typography
                  style={{
                    color: colors.danger,
                  }}
                  variant="caption"
                >
                  {errors.password ? errors.password.message : ""}
                </Typography>
              </Box>
              <Box mt={3}>
                <Button
                  size="large"
                  variant="contained"
                  color="primary"
                  type="submit"
                  style={{
                    borderRadius: "2em",
                    width: "100%",
                    backgroundColor: colors.primary,
                  }}
                >
                  دخول
                </Button>
              </Box>
            </form>
            <Box mt={3}>
              <Typography variant="h6"> يمكنك الدخول عن طريق </Typography>
              <Box display="flex" flexDirection="row" justifyContent="center">
                <Button
                  href="http://localhost:3001/auth/facebook"
                  style={{
                    color: colors.primary,
                  }}
                >
                  <Icon
                    className="fab fa-facebook"
                    style={{
                      fontSize: "2rem",
                    }}
                  ></Icon>
                </Button>
                <Button
                  href="http://localhost:3001/auth/google"
                  style={{
                    color: colors.primary,
                  }}
                >
                  <Icon
                    className="fab fa-google"
                    style={{
                      fontSize: "2rem",
                    }}
                  ></Icon>
                </Button>
              </Box>
            </Box>
          </Box>
        </Grid>
        <Grid item md={4} sm={6} xs={12} className={clases.gridLeft}>
          <Box py={4}>
            <Container>
              <Box className={clases.responsiveTypo}>
                <Typography variant="h4" className={clases.ma3lomaHead}>
                  معلومة
                </Typography>
                <Typography variant="caption">
                  تم انشاء موقع حميات مصر لغرض تقديم معلومات كافيه عن اماكن
                  المستشفيات الخاصة بالكشف عن مرض كورونا المستجد
                </Typography>
              </Box>
              <Box mt={3}>
                <Typography variant="h6" align="left">
                  يشمل ذلك
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon
                      style={{
                        color: "#fff",
                      }}
                    >
                      <LocalHospitalRounded />
                    </ListItemIcon>
                    <ListItemText className={clases.responsiveTypo}>
                      المستشفيات
                    </ListItemText>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon
                      style={{
                        color: "#fff",
                      }}
                    >
                      <InfoRounded />
                    </ListItemIcon>
                    <ListItemText className={clases.responsiveTypo}>
                      العناوين
                    </ListItemText>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon
                      style={{
                        color: "#fff",
                      }}
                    >
                      <PhoneRounded />
                    </ListItemIcon>
                    <ListItemText className={clases.responsiveTypo}>
                      التليفونات
                    </ListItemText>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon
                      style={{
                        color: "#fff",
                      }}
                    >
                      <MapRounded />
                    </ListItemIcon>
                    <ListItemText className={clases.responsiveTypo}>
                      الوصول لاقرب مستشفي
                    </ListItemText>
                  </ListItem>
                </List>
              </Box>
              <Box mt={3}>
                <Typography variant="subtitle2" align="center">
                  تمت برمجه وتصميم الموقع عن طريق مطور برمجيات: اسلام سعيد
                </Typography>
              </Box>
              <Box mt={4}>
                <Typography variant="subtitle2" align="center">
                  للتواصل
                </Typography>
                <List component="nav" className={clases.listVertical}>
                  <ListItem className={clases.listItem}>
                    <a
                      href="https://www.facebook.com/islamsaeed1998/"
                      target="_blank"
                      style={{
                        color: "#f8f8f8",
                      }}
                    >
                      <Facebook />
                    </a>
                  </ListItem>
                  <ListItem className={clases.listItem}>
                    <a
                      href="https://github.com/eslamSaeed12"
                      style={{
                        color: "#f8f8f8",
                      }}
                      target="_blank"
                    >
                      <GitHub />
                    </a>
                  </ListItem>
                  <ListItem className={clases.listItem}>
                    <Tooltip title="islam.s.mhmd1998@gmail.com">
                      <Email />
                    </Tooltip>
                  </ListItem>
                </List>
              </Box>
            </Container>
          </Box>
        </Grid>
      </Grid>
      <AlertComponent
        msg={signInError}
        open={open}
        refs={snackRef}
        onClose={() => setopen(false)}
      />
      {authLoad ? <LoaderSpinner /> : ""}
    </Box>
  );
};

Login.getInitialProps = (ctx) => {
  const cookiesLoader = nextCookies(ctx);
  const jwtCookie = cookiesLoader["META-AUTH-TOKEN"];
  return { auth_token: jwtCookie };
};

export default connect((state) => {
  return { ...state };
})(Login);
