import { ManageResourcesService } from "../shared/manage.service";
import { PLATFORM_ID, Inject, Injectable } from "@angular/core";

import { BehaviorSubject } from "rxjs";
// @ts-ignore
@Injectable({ providedIn: "root" })
export class AuthService {
  constructor(private sharedService: ManageResourcesService) {}
  isLoggedIn = new BehaviorSubject(false);
  loggedStage = this.isLoggedIn.asObservable();

  login(email: string, password: string) {
    const data = {
      email,
      password,
    };
    return this.sharedService.postReq("/login", data);
  }

  signup(email: string, password: string) {
    const data = {
      email,
      password,
    };
    return this.sharedService.postReq("/register", data);
  }

  updatePassword(password: string, token: string) {
    return this.sharedService.updateReq(`/updatePassword`, {
      password: password,
      token: token,
    });
  }

  setToken(token: string) {
    localStorage.setItem("token", token);
    this.isLoggedIn.next(true);
  }

  loggedIn() {
    if (this.sharedService.isBrowser()) {
      if (localStorage.getItem("token")) {
        this.isLoggedIn.next(true);
        return true;
      }
      return false;
    }
    return false;
  }
  logout() {
    this.isLoggedIn.next(false);
    localStorage.removeItem("token");
  }
}
