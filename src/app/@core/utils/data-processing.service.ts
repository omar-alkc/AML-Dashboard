import { Injectable } from '@angular/core';

export interface TimeseriesDataPoint {
  date: string;
  value: number;
  [key: string]: any;
}

export type BucketSize = 'day' | 'week' | 'month';

@Injectable()
export class DataProcessingService {
  /**
   * Groups time series data into buckets (day, week, month)
   */
  groupTimeseriesByBucket(
    data: Array<{ date: string; [key: string]: any }>, 
    bucketSize: BucketSize,
    valueField: string
  ): TimeseriesDataPoint[] {
    if (!data || data.length === 0) {
      return [];
    }
    
    // Create buckets based on the bucket size
    const buckets = new Map<string, TimeseriesDataPoint>();
    
    data.forEach(item => {
      const date = new Date(item.date);
      let bucketDate: string;
      
      // Determine bucket key based on bucket size
      switch (bucketSize) {
        case 'day':
          bucketDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
          break;
        case 'week':
          // Get the Monday of the week
          const day = date.getDay();
          const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
          const monday = new Date(date.setDate(diff));
          bucketDate = monday.toISOString().split('T')[0];
          break;
        case 'month':
          bucketDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          break;
        default:
          bucketDate = date.toISOString().split('T')[0];
      }
      
      // Add or update bucket
      if (!buckets.has(bucketDate)) {
        buckets.set(bucketDate, { date: bucketDate, value: 0 });
      }
      
      const bucket = buckets.get(bucketDate);
      bucket.value += (item[valueField] || 1); // Add the value or default to 1
    });
    
    // Convert to array and sort by date
    return Array.from(buckets.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Calculates derived metrics between two time series
   * For example, calculate pending = created - processed
   */
  calculateDerivedTimeseries(
    series1: TimeseriesDataPoint[], 
    series2: TimeseriesDataPoint[],
    operation: 'subtract' | 'add' | 'multiply' | 'divide' = 'subtract'
  ): TimeseriesDataPoint[] {
    // Create a map of dates to values for both series
    const map1 = new Map(series1.map(item => [item.date, item.value]));
    const map2 = new Map(series2.map(item => [item.date, item.value]));
    
    // Get all unique dates from both series
    const allDates = [...new Set([...map1.keys(), ...map2.keys()])];
    
    // Calculate the derived values
    return allDates.map(date => {
      const value1 = map1.get(date) || 0;
      const value2 = map2.get(date) || 0;
      let derivedValue: number;
      
      switch (operation) {
        case 'add':
          derivedValue = value1 + value2;
          break;
        case 'multiply':
          derivedValue = value1 * value2;
          break;
        case 'divide':
          derivedValue = value2 !== 0 ? value1 / value2 : 0;
          break;
        case 'subtract':
        default:
          derivedValue = value1 - value2;
      }
      
      return { date, value: derivedValue };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Aggregates data by a given field
   */
  aggregateByField(
    data: Array<{ [key: string]: any }>,
    groupField: string,
    countField?: string
  ): Array<{ name: string; value: number }> {
    if (!data || data.length === 0) {
      return [];
    }
    
    const aggregation = new Map<string, number>();
    
    data.forEach(item => {
      const key = item[groupField] || 'Unknown';
      const value = countField ? (item[countField] || 0) : 1;
      
      if (!aggregation.has(key)) {
        aggregation.set(key, 0);
      }
      
      aggregation.set(key, aggregation.get(key) + value);
    });
    
    return Array.from(aggregation.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort by value descending
  }

  /**
   * Creates a heatmap data structure from a collection of items
   */
  createHeatmapData(
    data: Array<{ [key: string]: any }>,
    rowField: string,
    columnField: string,
    valueField?: string
  ): {
    rows: string[];
    columns: string[];
    data: Array<{ row: string; col: string; value: number }>;
  } {
    if (!data || data.length === 0) {
      return { rows: [], columns: [], data: [] };
    }
    
    // Extract unique row and column values
    const rowValues = [...new Set(data.map(item => item[rowField] || 'Unknown'))];
    const columnValues = [...new Set(data.map(item => item[columnField] || 'Unknown'))];
    
    // Create a map for counting occurrences
    const heatmapData = new Map<string, number>();
    
    // Count values
    data.forEach(item => {
      const row = item[rowField] || 'Unknown';
      const col = item[columnField] || 'Unknown';
      const key = `${row}:${col}`;
      const value = valueField ? (item[valueField] || 0) : 1;
      
      if (!heatmapData.has(key)) {
        heatmapData.set(key, 0);
      }
      
      heatmapData.set(key, heatmapData.get(key) + value);
    });
    
    // Convert to required format
    const result = {
      rows: rowValues,
      columns: columnValues,
      data: Array.from(heatmapData.entries()).map(([key, value]) => {
        const [row, col] = key.split(':');
        return { row, col, value };
      }),
    };
    
    return result;
  }
}
