import Button from "@material-ui/core/Button";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import { makeStyles } from "@material-ui/core/styles";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function CustomizedSnackbars(props) {
  return (
    <div>
      <Snackbar
        open={props.open}
        autoHideDuration={6000}
        onClose={props.handleClose}
      >
        <Alert onClose={props.handleClose} severity={props.type}>
          {props.msg}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default CustomizedSnackbars;
