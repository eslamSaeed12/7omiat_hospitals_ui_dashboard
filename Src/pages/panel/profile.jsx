import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
} from "@material-ui/core";
import DialogErr from "../../components/ErrorsDialog";
import Layout from "../../components/control_panel_layout";
import IFetch from "isomorphic-unfetch";
import PageLoader from "../../components/PageLoader";
import { connect } from "react-redux";
import { colors } from "../../../public/styles.json";
import { syncfetchUserInofrmation } from "../../actions/actions";
import { validAuth } from "../../helpers/auth.ctx";
import nextCookies from "next-cookies";
import { Skeleton } from "@material-ui/lab";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import userClient from "../../helpers/user.client";

const usersCreateSchema = yup.object().shape({
  username: yup.string().min(4).max(18).required(),
  email: yup.string().email().required().max(255),
  password: yup.lazy((val) => {
    if (!val) {
      return yup.string().notRequired();
    }
    return yup.string().min(8).max(18).required();
  }),
  oldPassword: yup.string().length(64).required(),
});

const ProfilePage = (props) => {
  const [loading, setLoading] = useState(true);
  const [authUserLoad, setAuthUserLoad] = useState(false);
  const [updateProfileErrors, setUpdateProfileErrors] = useState([]);
  useEffect(() => {
    setLoading(false);
    console.log(props);
  }, []);
  useEffect(() => {
    props.fetchAuthUser(props.auth_token, props.id);
  }, [props.auth_token, props.id]);

  useEffect(() => {
    if (Object.keys(props.authUser).length) {
    }
    setAuthUserLoad(true);
  }, [props.authUser]);

  const handleProfileForm = (data) => {
    console.log(data);
    if (props.auth_token) {
      const httpUser = userClient(props.auth_token);
      httpUser
        .updateProfile({
          ...data,
          id: props.id || 0,
          password: data.password ? data.password : data.oldPassword,
        })
        .then((e) => {
          console.log(e);
        })
        .catch((e) => {
          console.log();
          if (e.response) {
            setUpdateProfileErrors([...e.response.data.errors]);
          } else {
            setUpdateProfileErrors([e.message]);
          }
        });
    }
  };

  const { handleSubmit, errors, control } = useForm({
    validationSchema: usersCreateSchema,
    defaultValues: {
      username: props.data.username,
      email: props.data.email,
      password: "",
      oldPassword: props.data.password,
    },
  });

  if (loading) {
    return <PageLoader color={colors.info} />;
  }

  return (
    <Layout>
      <Box>
        <Container>
          <Typography variant="h4" align="center">
            الصفحة الشخصية
          </Typography>
          {!authUserLoad ? (
            <Skeleton variant="rect" height="180px" />
          ) : (
            <Box mt={4}>
              <Grid
                item
                lg={4}
                md={5}
                sm={6}
                xs={8}
                style={{ margin: "0 auto" }}
              >
                <Paper elevation={6}>
                  <Box py={4} textAlign="center">
                    <form onSubmit={handleSubmit(handleProfileForm)}>
                      <Box my={3}>
                        <Controller
                          as={<TextField />}
                          name="username"
                          control={control}
                          type="text"
                          variant="outlined"
                          label="الاسم الشخصي"
                          defaultValue={props.data.username}
                          error={Boolean(errors.username)}
                          helperText={
                            errors.username ? errors.username.message : " "
                          }
                        />
                      </Box>
                      <Box my={3}>
                        <Controller
                          as={<TextField />}
                          name="email"
                          type="email"
                          control={control}
                          variant="outlined"
                          label="الايميل"
                          defaultValue={props.data.email}
                          error={Boolean(errors.email)}
                          helperText={errors.email ? errors.email.message : ""}
                        />
                      </Box>

                      <Box my={3}>
                        <Controller
                          as={<TextField />}
                          name="password"
                          type="password"
                          variant="outlined"
                          label="الباسورد"
                          control={control}
                          error={Boolean(errors.password)}
                          helperText={
                            errors.password ? errors.password.message : ""
                          }
                          defaultValue={""}
                        />
                        <Box hidden={true}>
                          <Controller
                            as={<TextField />}
                            name="oldPassword"
                            type="password"
                            variant="outlined"
                            defaultValue={props.data.password}
                            label="الباسورد"
                            control={control}
                          />
                        </Box>
                      </Box>
                      <Box>
                        <Button
                          variant="contained"
                          type="submit"
                          size="large"
                          style={{
                            backgroundColor: colors.primary,
                            color: "#f8f8f8",
                          }}
                        >
                          تحديث
                        </Button>
                      </Box>
                    </form>
                  </Box>
                </Paper>
              </Grid>
            </Box>
          )}
        </Container>
        {updateProfileErrors.length ? (
          <DialogErr
            errTitle="خطأ"
            errs={updateProfileErrors}
            onClose={() => setUpdateProfileErrors([])}
            open={Boolean(updateProfileErrors.length)}
          />
        ) : (
          ""
        )}
      </Box>
    </Layout>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchAuthUser: (jwt, id) => dispatch(syncfetchUserInofrmation(jwt, id)),
  };
};

ProfilePage.getInitialProps = async (ctx) => {
  try {
    await validAuth({ ctx });
    const cookiesLoader = nextCookies(ctx);
    const jwtCookie = cookiesLoader["META-AUTH-TOKEN"];
    const jwtDecoderPlugin = require("jwt-decode");
    let jwtDecoded;
    if (jwtCookie) {
      jwtDecoded = jwtDecoderPlugin(jwtCookie);
    }
    const cookieOFBrowser = await IFetch(
      `http://localhost:3001/user/${jwtDecoded.id}`,
      {
        method: "get",
        headers: { token: jwtCookie },
      }
    ).catch((e) => console.log(e));

    return {
      auth_token: jwtCookie,
      mapboxToken: process.env.mapboxToken,
      id: jwtDecoded ? jwtDecoded.id : null,
      data: (await cookieOFBrowser.json()).data,
    };
  } catch (e) {
    console.log(e);
  }
};

export default connect((state) => state, mapDispatchToProps)(ProfilePage);
