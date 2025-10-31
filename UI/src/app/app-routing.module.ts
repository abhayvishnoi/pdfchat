import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthComponent } from "./auth/auth.component";
import { AuthGuard } from "./auth/auth.guard";
import { DashboardComponent } from "./dashboard/dashboard.component";

const routes: Routes = [
  { path: "", pathMatch: "full", redirectTo: "auth" },
  {
    path: "auth",
    component: AuthComponent,
  },
  { path: "chat", component: DashboardComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
