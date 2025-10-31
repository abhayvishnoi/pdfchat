import { Component, OnInit } from "@angular/core";
import { AuthService } from "../auth/auth.service";
import { Router } from "@angular/router";
import { ManageResourcesService } from "../shared/manage.service";
import { provideMarkdown } from "ngx-markdown";
import { MarkdownService } from "ngx-markdown";
import { ActivatedRoute } from "@angular/router";
import { firstValueFrom } from "rxjs";

@Component({
  selector: "app-dashboard",
  providers: [provideMarkdown()],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
})
export class DashboardComponent implements OnInit {
  menuOpen = true;
  showDocs = false;
  chatId = "new";
  chatDetails: any = { attachments: [] };
  pageNo = 1;
  chatHistory: any = [];
  files: File[] = [];
  options: string[] = [];
  selectedOption: string = "";
  acceptedFileFormats: Array<string> = [];
  chatMessages: any = [];
  userMessage = "";
  isNew = true;
  uploading: boolean = false;
  docsLoaded: boolean = false;
  counter: number = 0;

  ngOnInit(): void {
    this.chatMessages.push({
      sender: "ai",
      text: "",
    });
    this.typingEffect(
      "Hello,Welcome to Doc Insights from https://github.com/abhayvishnoi"
    );
    this.acceptedFileFormats = [".pdf"];
    this.getChatList();
  }
  constructor(
    private auth: AuthService,
    private router: Router,
    private manageResource: ManageResourcesService,
    private activatedRoute: ActivatedRoute,
    private markdownService: MarkdownService
  ) {}

  getChatList() {
    this.manageResource.postReq("/chatlist").subscribe((res) => {
      this.chatHistory = res;
    });
  }

  loadChat(chat: any) {
    console.log("chat", chat);

    this.manageResource.getReq(`/chat/${chat._id}`).subscribe((res) => {
      this.isNew = false;
      this.chatDetails = res;
      this.chatMessages = res.messages;
      if (this.chatMessages.length == 0) {
        this.chatMessages.push({
          sender: "ai",
          text: "",
        });
        this.typingEffect(
          "Hello,Welcome to DoChat from https://github.com/abhayvishnoi"
        );
      }
    });
  }
  afterPdfLoaded($event: any) {
    this.docsLoaded = true;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(["/"]);
  }
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  copied() {}
  sendMessage() {
    if (this.userMessage != "" && this.chatDetails.attachments.length > 0) {
      this.chatMessages.push({
        sender: "user",
        text: this.userMessage,
      });
      this.chatMessages.push({
        sender: "ai",
        text: "Typing ..",
        loading: true,
      });
      this.manageResource
        .postReq(`/prompt/${this.chatDetails._id}`, {
          sender: "user",
          text: this.userMessage,
        })
        .subscribe((res) => {
          this.prompt(res.text);
        });
      this.userMessage = "";
    }
  }
  extractJson(res: any) {
    console.log("correct 2", res);

    return "result";
  }

  markDownToHtml(markdown: string) {
    return this.markdownService.parse(markdown, {
      // disableSanitizer: true,
      // decodeHtml: true,
    });
  }

  private extractPageNumbers(text: string): number[] {
    const pageNumbers: number[] = [];

    // Pattern: "Page Number": [5, 8, 9, 10]
    const jsonPattern = /"Page Number":\s*\[([\d,\s]+)\]/;
    const jsonMatch = text.match(jsonPattern);
    if (jsonMatch) {
      pageNumbers.push(
        ...jsonMatch[1].split(",").map((num) => parseInt(num.trim()))
      );
    }

    // Pattern: "Page X" or "page X" or "Page Number: X"
    const singlePagePattern = /(?:page|Page)(?:\s+Number)?:?\s+(\d+)/g;
    let match;
    while ((match = singlePagePattern.exec(text)) !== null) {
      pageNumbers.push(parseInt(match[1]));
    }

    // Pattern: "pages X-Y" or "Pages X-Y"
    const rangePattern = /(?:pages|Pages)\s+(\d+)-(\d+)/g;
    while ((match = rangePattern.exec(text)) !== null) {
      const start = parseInt(match[1]);
      const end = parseInt(match[2]);
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }
    }

    return [...new Set(pageNumbers)]; // Remove duplicates
  }

  private createPageSpan(pageNum: number): string {
    return `<span class="page-link cursor-pointer text-emerald-500" data-page="${pageNum}">${pageNum}</span>`;
  }

  wrapPageNumbers(htmlContent: any): string {
    const pageNumbers = this.extractPageNumbers(htmlContent);
    let processedContent = htmlContent;

    // Sort page numbers in descending order to avoid replacing parts of larger numbers
    pageNumbers.sort((a, b) => b - a);

    for (const pageNum of pageNumbers) {
      const patterns = [
        `"Page Number": ${pageNum}`,
        `Page ${pageNum}`,
        `page ${pageNum}`,
        `Page Number: ${pageNum}`,
        `page number ${pageNum}`,
      ];

      patterns.forEach((pattern) => {
        const regex = new RegExp(pattern, "g");
        processedContent = processedContent.replace(regex, (match: any) =>
          match.replace(pageNum.toString(), this.createPageSpan(pageNum))
        );
      });
    }

    return processedContent;
  }

  deleteChat(chat: any) {
    this.manageResource.deleteReq(`/chat/${chat._id}`).subscribe((res) => {
      this.chatHistory.splice(this.chatHistory.indexOf(chat), 1);
    });
  }

  changePage(page: number) {
    console.log(page);

    this.pageNo = page;
  }

  async prompt(res: string) {
    // const markDownHTML = await this.markDownToHtml(res);
    // console.log("markDownHTML", markDownHTML);
    // const newMarkdown = this.wrapPageNumbers(markDownHTML);
    // console.log("newMarkdown", newMarkdown);
    // console.log(res);
    this.typingEffect(res);
  }

  typingEffect(message: string) {
    const words = message.split(" ");

    for (let i = 0; i < words.length; i++) {
      if (i == 0) {
        this.chatMessages[this.chatMessages.length - 1].loading = false;
        this.chatMessages[this.chatMessages.length - 1].text = "";
      }
      setTimeout(() => {
        this.chatMessages[this.chatMessages.length - 1].text += words[i] + " ";
        if (i == words.length - 1) {
          this.findPageButtons();
        }
      }, i * 10);
    }
  }

  findPageButtons() {
    // const buttons = document.querySelectorAll(".page-link");

    // buttons.forEach((button) => {
    //   console.log("button", button);

    //   button.addEventListener("click", () => {
    //     this.pageNo = parseInt(button.innerHTML);
    //     console.log("pageNo", this.pageNo);
    //   });
    // });
    document.addEventListener("click", (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("page-link")) {
        e.preventDefault();
        const pageNum = parseInt(target.innerText || "1");
        console.log(pageNum);

        this.changePage(pageNum);
      }
    });
  }
  //code to use gemini api for chatbot using large context model

  onFileSelected(event: any): void {
    const selectedFiles = Array.from(event.target.files) as File[];
    this.handleFiles(selectedFiles);
  }
  onDrop(event: any): void {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files) as File[];
    this.handleFiles(droppedFiles);
  }
  onDragOver(event: any): void {
    event.preventDefault();
  }
  handleFiles(files: File[]): void {
    files.forEach((file) => {
      let extension = file.name
        .substring(file.name.lastIndexOf("."))
        .toLowerCase();
      // if (this.acceptedFileFormats.includes(extension)) {
      //reader.onload = () => {
      this.files.push(file);
      // const obj = {
      //   pdf: file.name,
      // };
      // }
    });
    if (this.files.length === 0) {
      alert("No valid file selected");
    }
  }

  handleUploadRes(res: any) {
    console.log("handleUploadRes", res);

    this.chatHistory.unshift({
      _id: res._id,
      title: res.title,
    });
    this.uploading = false;
    this.loadChat(this.chatHistory[0]);
  }

  async uploadFiles() {
    this.uploading = true;
    this.counter = 0;
    let chatId = "new";
    for (let i = 0; i < this.files.length; i++) {
      const file = this.files[i];
      const formData = new FormData();
      formData.append("pdf", file, file.name);

      const promise: any = await firstValueFrom(
        this.manageResource.uploadReq(`/upload/${chatId}`, formData)
      );
      this.counter++;
      chatId = promise._id;
      if (i == this.files.length - 1) {
        this.chatDetails = promise;
        this.handleUploadRes(promise);
      }
      chatId = promise._id;
    }
  }
  removeFile(index: number): void {
    this.files.splice(index, 1);
  }

  newChat() {
    this.chatMessages = [];
    this.chatDetails = {};
    this.isNew = true;
    this.chatMessages.push({
      sender: "ai",
      text: "",
    });
    this.typingEffect("Welcome to DoChat by AV Projects");
    // this.acceptedFileFormats = ['.pdf']
  }
}
