import {
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Button,
  DialogActions,
} from "@material-ui/core";
import { colors } from "../../public/styles.json";
const ErrorsDialog = (props) => {
  const errlist = props.errs;
  return (
    <Dialog open={props.open}>
      <DialogTitle id="validation-dialog-errs">{props.errTitle}</DialogTitle>
      <List>
        {errlist.map((err, id) => {
          return (
            <ListItem key={"validation-err-n" + id.toString()}>
              <ListItemText style={{ color: colors.danger }}>
                {err}
              </ListItemText>
            </ListItem>
          );
        })}
      </List>
      <DialogActions>
        <Button
          onClick={() => props.onClose()}
          variant="contained"
          style={{ backgroundColor: colors.danger, color: "#fff" }}
        >
          اغلاق
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ErrorsDialog;
