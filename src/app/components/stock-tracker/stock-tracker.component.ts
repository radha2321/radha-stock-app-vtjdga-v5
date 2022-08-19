import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { StockTrackerService } from '../../services/stock-tracker.service';
import { StockInfo, Stocks } from '../../models/stock';

@Component({
  selector: 'app-stock-tracker',
  templateUrl: './stock-tracker.component.html',
  styleUrls: ['./stock-tracker.component.css'],
})
export class StockTrackerComponent implements OnInit, OnDestroy {
  stockFormGroup: FormGroup;
  stockInfo: StockInfo[] = [];
  stockDisplayList: Stocks[] = [];
  quoteData = [];
  hasLoading: boolean = false;
  subscription: Subscription = new Subscription();

  constructor(private readonly stockService: StockTrackerService) {}

  ngOnInit(): void {
    this.createStockTracerForm();
    this.getStocks();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  removeStock(indx: number): void {
    this.stockDisplayList.splice(indx, 1);
    this.stockService.setDataIntoStore(this.stockDisplayList);
    this.stockInfo = this.stockDisplayList;
  }

  createStockTracerForm(): void {
    this.stockFormGroup = new FormGroup({
      symbol: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(5),
      ]),
    });
  }

  setQuoteDetails(): void {
    const { symbol } = this.stockFormGroup.value;
    this.subscription.add(
      this.stockService.getQuotesInfo(symbol).subscribe((data) => {
        this.quoteData.push(data);
        this.stockInfo.map((element, i) => {
          this.stockDisplayList[i] = {
            description: element.description,
            symbol: element.symbol,
            d: this.quoteData[i]?.d,
            c: this.quoteData[i]?.c,
            o: this.quoteData[i]?.o,
            h: this.quoteData[i]?.h,
          };
        });
        this.stockService.setDataIntoStore(this.stockDisplayList);
        this.hasLoading = false;
      })
    );
    this.stockFormGroup.reset();
  }

  getStocks(): void {
    const stocks = localStorage.getItem('stockData');
    this.stockDisplayList = stocks ? JSON.parse(stocks) : [];
    this.stockInfo = this.stockDisplayList;
  }

  submit(): void {
    this.getStckCompanyNames();
  }

  getStckCompanyNames(): void {
    this.hasLoading = true;
    const { symbol } = this.stockFormGroup.value;
    this.subscription.add(
      this.stockService.getStckCompanyNames(symbol).subscribe((data: any) => {
        const list = {
          description: data.result[0].description,
          symbol: data.result[0].symbol,
        };
        this.stockInfo.push(list);
        this.setQuoteDetails();
        this.hasLoading = false;
      })
    );
  }
}
