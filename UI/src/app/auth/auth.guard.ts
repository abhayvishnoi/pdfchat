import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}
  canActivate(): boolean {
    if (
      // this.authService.loggedIn() &&
      // localStorage.getItem('token') == 'success'
      true
    ) {
      console.log("auth true");

      return true;
    } else {
      console.log("auth false");
      this.router.navigate(["/auth"]);
      return false;
    }
  }
}
