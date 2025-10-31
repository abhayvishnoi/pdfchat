import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { RouterModule } from "@angular/router";
import { HttpClientModule } from "@angular/common/http";
import { MatSliderModule } from "@angular/material/slider";
import { ClipboardModule } from "@angular/cdk/clipboard";
import { MarkdownModule } from "ngx-markdown";

const modules = [
  CommonModule,
  MarkdownModule,
  FormsModule,
  ReactiveFormsModule,
  MatIconModule,
  ClipboardModule,
  MatIconModule,
  ReactiveFormsModule,
  FormsModule,
  RouterModule,
  MatSliderModule,
  HttpClientModule,
];

@NgModule({
  declarations: [],
  imports: [...modules],
  exports: [...modules],
})
export class SharedModule {}
