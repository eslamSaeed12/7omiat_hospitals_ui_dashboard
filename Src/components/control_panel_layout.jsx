import { useState, useEffect, Fragment } from "react";
import {
  Box,
  Typography,
  Button,
  Menu,
  MenuItem,
  Container,
  Fab,
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { makeStyles } from "@material-ui/core/styles";
import { colors } from "../../public/styles.json";
import { HashLoader } from "react-spinners";
import Link from "next/link";
import { connect } from "react-redux";
import {
  Lock,
  AccountCircle,
  LocalHospital,
  Map,
  SupervisedUserCircleSharp,
  HomeRounded,
  ErrorOutlineRounded,
  ArrowDropDown,
  DescriptionRounded,
} from "@material-ui/icons";
import cookie from "js-cookie";
import { useRouter } from "next/router";

const categories = [
  {
    name: "الرئيسية",
    href: "/panel/home",
    icon: HomeRounded,
  },
  {
    name: "السجلات",
    href: "/panel/logs",
    icon: DescriptionRounded,
  },
  {
    name: "الاعطال",
    href: "/panel/errors",
    icon: ErrorOutlineRounded,
  },
  {
    name: "المشرفين",
    href: "/panel/users",
    icon: SupervisedUserCircleSharp,
  },
  {
    name: "الصلاحيات",
    href: "/panel/roles",
    icon: Lock,
  },
  {
    name: "المستشفيات",
    href: "/panel/hospitals",
    icon: LocalHospital,
  },
  {
    name: "المحافظات",
    href: "/panel/govs",
    icon: Map,
  },
];

const styles = makeStyles((theme) => {
  return {
    root: {},
    sidebar: {
      color: "#f8f8f8",
      backgroundColor: colors.primary,
      [theme.breakpoints.down("sm")]: {
        flexDirection: "row",
        height: "auto",
        width: "100vw",
      },
    },
    list: {
      [theme.breakpoints.up("md")]: {
        height: "100%",
      },
      [theme.breakpoints.down("sm")]: {
        height: "auto",
        flexDirection: "row",
      },
    },
    listItem: {
      color: "#F8F8F8",
      fontSize: "13px",
    },
    container: {
      [theme.breakpoints.down("sm")]: {
        width: "100%",
      },
    },
    sidebarContainer: {
      boxShadow: theme.shadows[20],
      width: "8%",
      //overflowX: "hidden",
      position: "fixed",
      left: 0,
      zIndex: 555,
      [theme.breakpoints.down("sm")]: {
        overflowX: "scroll",
        bottom: 0,
        width: "100%",
      },
    },
  };
});

const SideBar = (props) => {
  const clases = styles();

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (ev) => {
    setAnchorEl(ev.currentTarget);
  };
  const handleCloseMenu = (ev) => {
    setAnchorEl(null);
  };

  const MapSidBarItems = () => {
    const list = categories.map((cat, index) => {
      return (
        <Fragment key={index.toString()}>
          <Link href={cat.href}>
            <Button>
              <Box
                textAlign="center"
                className={clases.listItem}
                id={index.toString()}
              >
                <cat.icon
                  style={{
                    fontSize: "4.5vmin",
                    margin: "0",
                    paddingTop: "5px",
                  }}
                />
                <Typography style={{ fontSize: "13px", margin: 0 }}>
                  {cat.name}
                </Typography>
              </Box>
            </Button>
          </Link>
        </Fragment>
      );
    });

    return list;
  };

  return (
    <Box
      height="100vh"
      dispaly="flex"
      flexDirection="column"
      className={clases.sidebar}
    >
      <Box
        className={clases.list}
        display="flex"
        flexDirection="column"
        justifyContent="center"
      >
        {MapSidBarItems()}
      </Box>
    </Box>
  );
};

const HomePage = (props) => {
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const Router = useRouter();

  const logoutHandeler = () => {
    cookie.remove("META-AUTH-TOKEN", { path: "/" });
    Router.push("/panel/login");
  };

  const clases = styles();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {}, [props.authUser]);

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
    <Box style={{ backgroundColor: "#ffff" }}>
      <Box className={clases.sidebarContainer}>
        <SideBar />
      </Box>
      <Box
        width="92%"
        style={{ marginRight: "auto" }}
        className={clases.container}
        pb={10}
        pt={4}
      >
        <Container>
          <Box>
            {props.authUserLoad ? (
              <Fab
                style={{ backgroundColor: colors.primary }}
                variant="extended"
                aria-controls="profile-menu"
                aria-haspopup="true"
                onClick={handleClick}
              >
                <ArrowDropDown style={{ color: "#f8f8f8" }} />
                <Typography style={{ color: "#f8f8f8" }} variant="subtitle2">
                  {props.authUser.username}
                </Typography>
              </Fab>
            ) : (
              <Skeleton variant="text" width="150px" />
            )}

            <Menu
              id="simple-menu"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={() => Router.push("/panel/profile")}>
                الصفحة الشخصية
              </MenuItem>
              <MenuItem onClick={logoutHandeler}>خروج</MenuItem>
            </Menu>
          </Box>
        </Container>
        <Box mb={4}>{props.children}</Box>
      </Box>
    </Box>
  );
};

export default connect((state) => state)(HomePage);
