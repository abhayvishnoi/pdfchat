import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "./auth.service";
@Component({
  selector: "app-auth",
  templateUrl: "./auth.component.html",
  styleUrl: "./auth.component.scss",
})
export class AuthComponent {
  authForm!: FormGroup;

  type: "login" | "signup" | "reset" = "login";
  serverMessage: string = "";
  submitted: boolean = false;
  msgClass: boolean = false;
  token: string = "";

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    if (this.authService.loggedIn()) {
      this.router.navigate(["chat"]);
    } else {
      this.createForm();
    }
  }
  ngOnInit(): void {
    this.authForm.valueChanges.subscribe(
      (res: any) => (this.serverMessage = "")
    );
  }
  createForm() {
    let idPhoneRegex = /^([a-z0-9]{5}|[a-z0-9]{10})$/i;
    let idRegex = /^[a-z0-9]{5}$/i;
    let passRegex = /^[a-z0-9]{8,}$/i;

    const formConfig: any = {
      email: [
        "",
        [
          Validators.required,
          Validators.pattern(this.type === "signup" ? idRegex : idPhoneRegex),
        ],
      ],
      password: ["", [Validators.required, Validators.pattern(passRegex)]],
    };

    this.authForm = this.fb.group(formConfig);
  }
  changeType(val: any) {
    this.type = val;
    this.serverMessage = "";
    this.submitted = false;
    this.msgClass = false;
    this.createForm();

    if (val !== "login") {
      this.authForm.setValue({
        email: "",
        password: "",
      });
    }
  }
  get email() {
    return this.authForm.get("email");
  }
  get password() {
    return this.authForm.get("password");
  }
  get isSignup() {
    return this.type === "signup";
  }
  get isLogin() {
    return this.type === "login";
  }

  handleResponse = (res: any) => {
    this.serverMessage = res.message;
    this.msgClass = true;
    if (!this.isReset && !this.isSignup) {
      this.authService.setToken("success");
      this.router.navigate(["dashboard", "reports"]);
    }
    this.submitted = false;
  };

  signInWithEmailAndPassword = async (email: string, password: string) => {
    await this.authService.login(email, password).subscribe(
      (res: any) => {
        res.message = res.PMAI001OperationResponse.ws_log_recout.ws_out_status;
        console.log("resmessage", res.message);
        if (res.message.includes("Login successful")) {
          this.handleResponse(res);
        } else {
          // throw throwError(() => res.message);
          this.serverMessage = res.message;
          this.submitted = false;
        }
      },
      (err: any) => {
        this.serverMessage = err.error.message;
        this.submitted = false;
      }
    );
  };
  createUserWithEmailAndPassword = async (id: string, password: string) => {
    await this.authService.signup(id, password).subscribe(
      (res: any) => {
        if (res.message.includes("REGISTRATION SUCCESSFULL")) {
          this.handleResponse(res);
          this.type = "login";
        } else {
          // throw throwError(() => res.message);
          this.serverMessage = res.message;
          this.submitted = false;
        }
      },
      (err: any) => {
        this.serverMessage = err.error.message;
        this.submitted = false;
      }
    );
  };

  sendPasswordResetEmail = async (id: string, newPassword: string) => {
    await this.authService.resetPassword(id, newPassword).subscribe(
      (res: any) => {
        if (res.message.includes("Password changed successfully")) {
          this.handleResponse(res);
          this.type = "login";
        } else {
          // throw throwError(() => res.message);
          this.serverMessage = res.message;
          this.submitted = false;
        }
      },
      (err: any) => {
        this.serverMessage = err.error.message;
        this.submitted = false;
      }
    );
  };

  onFormSubmit = async () => {
    const email = this.email!.value.toLowerCase();
    const password = this.password!.value;
    console.log(email, password);

    try {
      if (this.isLogin) {
        this.submitted = true;
        await this.signInWithEmailAndPassword(email, password);
      }
      if (this.isSignup) {
        this.submitted = true;
        await this.createUserWithEmailAndPassword(email, password);
      }
    } catch (error: any) {
      this.serverMessage = error;
    }
  };
}
