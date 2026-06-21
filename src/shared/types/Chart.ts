export declare class Chart<TType extends ChartType = ChartType, TData = DefaultDataPoint<TType>, TLabel = unknown> {
  readonly id: string;
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;

  data: ChartData<TType, TData, TLabel>;

  constructor(item: ChartItem, config: Object);

  clear(): this;
  stop(): this;
  reset(): void;
  update(fn?: Function): void;
  render(): void;
  draw(): void;
}

export declare type ChartItem =
  | string
  | CanvasRenderingContext2D
  | HTMLCanvasElement
  | { canvas: HTMLCanvasElement }
  | ArrayLike<CanvasRenderingContext2D | HTMLCanvasElement>;

interface ChartData<TType extends ChartType = ChartType, TData = DefaultDataPoint<TType>, TLabel = unknown> {
  labels?: TLabel[];
  xLabels?: TLabel[];
  yLabels?: TLabel[];
  datasets: ChartDataset<TType, TData>[];
}

type ChartType = keyof ChartTypeRegistry;

interface ChartTypeRegistry {
  bar: { datasetOptions: Object; defaultDataPoint: Object | number | null };
  line: { datasetOptions: Object; defaultDataPoint: Object | number | null };
  scatter: { datasetOptions: Object; defaultDataPoint: Object | number | null };
  bubble: { datasetOptions: Object; defaultDataPoint: Object | number | null };
  pie: { datasetOptions: Object; defaultDataPoint: Object | number | null };
  doughnut: { datasetOptions: Object; defaultDataPoint: Object | number | null };
  polarArea: { datasetOptions: Object; defaultDataPoint: Object | number | null };
  radar: { datasetOptions: Object; defaultDataPoint: Object | number | null };
}

type DefaultDataPoint<TType extends ChartType> = DistributiveArray<ChartTypeRegistry[TType]["defaultDataPoint"]>;

interface ChartDatasetProperties<TType extends ChartType, TData> {
  type?: TType;
  data: TData;
}

type ChartDataset<TType extends ChartType = ChartType, TData = DefaultDataPoint<TType>> = DeepPartial<
  { [key in ChartType]: { type: key } & ChartTypeRegistry[key]["datasetOptions"] }[TType]
> &
  ChartDatasetProperties<TType, TData>;

type DeepPartial<T> = T extends Function
  ? T
  : T extends Array<infer U>
    ? _DeepPartialArray<U>
    : T extends object
      ? _DeepPartialObject<T>
      : T | undefined;

type _DeepPartialArray<T> = Array<DeepPartial<T>>;
type _DeepPartialObject<T> = { [P in keyof T]?: DeepPartial<T[P]> };

type DistributiveArray<T> = [T] extends [unknown] ? Array<T> : never;
