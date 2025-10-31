import { HttpClient } from "@angular/common/http";
import { PLATFORM_ID, Inject, Injectable } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { Router } from "@angular/router";
import { environment } from "../../environments/environment";
@Injectable({
  providedIn: "root",
})
export class ManageResourcesService {
  private apiurl = "http://localhost:3000/api";
  private apiKey = environment.apiKey;
  store: any = {};
  userId = "";
  reqUrl = (endpoint: string) => this.apiurl + endpoint;
  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  getEventSource(url: string) {
    return new EventSource(this.apiurl + url);
  }

  postReq(url: string, data: Object = {}) {
    // console.log(data);
    return this.http.post<any>(this.reqUrl(url), data);
  }
  getReq(url: string, data: object = {}) {
    return this.http.get<any>(this.reqUrl(url), data);
  }
  updateReq(url: string, data: object = {}) {
    return this.http.put<any>(this.reqUrl(url), data);
  }
  deleteReq(url: string, data: object = {}) {
    return this.http.delete<any>(this.reqUrl(url), data);
  }
  uploadReq(url: string, formData: FormData) {
    return this.http.post(this.reqUrl(url), formData);
  }

  isBrowser() {
    if (isPlatformBrowser(this.platformId)) {
      return true;
    }
    return false;
  }
  setStore(key: string, value: any) {
    this.store[key] = value;
  }
  getStoreitem(key: string) {
    return this.store[key];
  }

  poppedEvent() {
    console.log("popped", window.location);
    this.navigateToURL(window.location.pathname);
  }

  navigateToURL(url: string) {
    // const currentRoute = this.router.url;
    // console.log('navigateToURL', url);

    this.router.navigateByUrl("/", { skipLocationChange: true }).then(() => {
      this.router.navigate([url]);
    });
  }
  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  // Get a value from local storage
  getItem(key: string): string | null {
    return localStorage.getItem(key);
  }

  // Remove a value from local storage
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  // Clear all items from local storage
  clear(): void {
    localStorage.clear();
  }
  async prompt(prompt: string) {
    // const model = this.model.getGenerativeModel({ model: 'gemini-1.5-flash' });
    // const result = await model.generateContent(prompt);
    // return result.response.text();
  }
}
