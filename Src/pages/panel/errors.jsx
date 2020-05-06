import {
  Box,
  Typography,
  Container,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Fab,
  Button,
  Tooltip,
  Popover,
} from "@material-ui/core";
import CSnackBar from "../../components/Snackbar";
import { Delete } from "@material-ui/icons";
import Layout from "../../components/control_panel_layout";
import DialogErr from "../../components/ErrorsDialog";
import PageLoader from "../../components/PageLoader";
import LogsClient from "../../helpers/errors.client";
import { connect } from "react-redux";
import { colors } from "../../../public/styles.json";
import { syncfetchUserInofrmation } from "../../actions/actions";
import { validAuth } from "../../helpers/auth.ctx";
import nextCookies from "next-cookies";
import { Skeleton } from "@material-ui/lab";
import { useState, useEffect } from "react";
import jsCookie from "js-cookie";
import svgBackground from "../../../public/images/errors.svg";
const LogsPage = (props) => {
  const [loading, setLoading] = useState(true);
  const [logsLoad, setLogsLoad] = useState(false);
  const [deleteLogId, setDeltedLogId] = useState(null);
  const [succeesOperation, setSuccessOperation] = useState(false);
  const [logsloadFail, setLogsLoadFail] = useState({
    fail: false,
    data: [],
  });
  const [logs, setLogs] = useState([]);
  const [stack, setStack] = useState([]);

  const successOperationClose = () => {
    setSuccessOperation(false);
  };

  useEffect(() => {
    setLoading(false);
  }, []);
  useEffect(() => {
    props.fetchAuthUser(props.auth_token, props.id);

    const logger = LogsClient(props.auth_token);

    logger
      .findAll()
      .then((e) => {
        setLogs([...e.data]);
        setLogsLoad(!logsLoad);
      })
      .catch((e) => {
        setLogsLoadFail({ fail: true, data: e.data });
      });
  }, [props.auth_token, props.id]);

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleDeletePopOverClick = (event) => {
    const node_ = event.currentTarget;
    const id = node_.getAttribute("aria-describedby") || 0;
    setAnchorEl(event.currentTarget);
    setDeltedLogId(id);
  };

  const handleDeletePopOverClose = () => {
    setAnchorEl(null);
  };

  const deleteLogRecord = (id) => {
    LogsClient(props.auth_token)
      .delete({ id })
      .then((e) => {
        handleDeletePopOverClose();
        setLogs((prevState) => {
          const data = [...prevState];
          const selected = logs.find((log) => log.id === id);
          data.splice(data.indexOf(selected), 1);
          return [...data];
        });
        setSuccessOperation(true);
      })
      .catch((e) => {
        if (e.response) {
          // here to declare errors
          setLogsLoadFail({ fail: true, data: [...e.response.data.errors] });
        } else {
          setLogsLoadFail({ fail: true, data: [e.message] });
        }

        // e.message if not e.response
      });
  };

  if (loading) {
    return <PageLoader color={colors.info} />;
  }

  return (
    <Layout>
      <Box>
        <Container>
          <Typography variant="h4" align="center">
            الاعطال
          </Typography>
          <Box align="center" my={3}>
            <img
              src={svgBackground}
              className="ERRORS-BACKGROUND-IMAGE"
            />
          </Box>
          {logsLoad ? (
            <TableContainer
              component={Paper}
              style={{ dir: "ltr" }}
              elevation={18}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="left">ID</TableCell>
                    <TableCell align="left">Name</TableCell>
                    <TableCell align="left">Message</TableCell>
                    <TableCell align="left">Stack</TableCell>
                    <TableCell align="left">Timestamp</TableCell>
                    <TableCell align="left">Manage</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log, id) => {
                    return (
                      <TableRow key={log.id}>
                        <TableCell component="th" scope="row">
                          {log.id}
                        </TableCell>
                        <TableCell>{log.name}</TableCell>
                        <TableCell>{log.message}</TableCell>
                        <TableCell>
                          <Button onClick={() => setStack([log.stack])}>
                            Stack
                          </Button>
                        </TableCell>
                        <TableCell>
                          {new Date(log.timestamp).toLocaleString("ar")}
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Fab
                              onClick={handleDeletePopOverClick}
                              aria-describedby={log.id}
                              size="small"
                              style={{
                                backgroundColor: colors.danger,
                                color: "#ffff",
                              }}
                            >
                              <Delete />
                            </Fab>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Skeleton variant="rect" height="180px" />
          )}
          <Popover
            elevation={20}
            id={"delete-log-pop"}
            open={Boolean(anchorEl)}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
            anchorEl={anchorEl}
            onClose={handleDeletePopOverClose}
          >
            <Box py={2} px={2}>
              {deleteLogId ? (
                <Typography>
                  هل تريد حذف الخطأ رقم
                  {deleteLogId}
                </Typography>
              ) : (
                <Skeleton variant="text" />
              )}
              <Button
                onClick={() => deleteLogRecord(deleteLogId)}
                variant="contained"
                style={{
                  color: "#f8f8f8",
                  marginTop: "5px",
                  backgroundColor: colors.danger,
                }}
              >
                حذف
              </Button>
            </Box>
          </Popover>
          {logsloadFail.fail ? (
            <DialogErr
              errs={logsloadFail.data}
              errTitle="خطأ"
              open={logsloadFail.fail}
              onClose={() => {
                setLogsLoadFail({ fails: false, data: [] });
                handleDeletePopOverClose();
                setDeltedLogId(null);
              }}
            />
          ) : (
            ""
          )}
          <CSnackBar
            msg="تم الحذف بنجاح"
            open={succeesOperation}
            type="success"
            handleClose={successOperationClose}
          />
          {stack.length ? (
            <DialogErr
              errs={stack}
              open={Boolean(stack)}
              errTitle="تفاصيل العطل"
              onClose={() => setStack([])}
            />
          ) : (
            ""
          )}
        </Container>
      </Box>
    </Layout>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchAuthUser: (jwt, id) => dispatch(syncfetchUserInofrmation(jwt, id)),
  };
};

LogsPage.getInitialProps = async (ctx) => {
  console.log(ctx.isServer);
  const cookiesLoader = nextCookies(ctx);
  const jwtCookie =
    cookiesLoader["META-AUTH-TOKEN"] || jsCookie.get("META-AUTH-TOKEN");
  const jwtDecoderPlugin = require("jwt-decode");
  let jwtDecoded;
  if (jwtCookie) {
    jwtDecoded = jwtDecoderPlugin(jwtCookie);
  }
  try {
    await validAuth({ ctx });
    return {
      auth_token: jwtCookie,
      mapboxToken: process.env.mapboxToken,
      id: jwtDecoded ? jwtDecoded.id : null,
    };
  } catch (e) {
    console.log(e);
  }
};
export default connect((state) => state, mapDispatchToProps)(LogsPage);
