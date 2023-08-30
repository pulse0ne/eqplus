import { Component, Context, ContextType, createRef } from 'react';
import styled, { DefaultTheme, ThemeContext } from 'styled-components';
import { AUDIO_CONTEXT, NYQUIST } from '../src-common/audio-constants';
import { FREQ_START } from '../src-common/audio-constants';
import { IFilter } from '../src-common/types/filter';
import { Theme } from '../src-common/types/theme';
import { darken } from 'color2k';

const TWO_PI = 2.0 * Math.PI;
const HANDLE_RADIUS = 4.5;
const SELECTED_HANDLE_RADIUS = 1.25 * HANDLE_RADIUS;
const HANDLE_CIRCUMFERENCE = 2 * HANDLE_RADIUS;
const DB_SCALE = 20.0;
const DPR = () => window.devicePixelRatio;

const FREQ_LINES = {
  '100': 100,
  '1k': 1000,
  '10k': 10000
};

const CanvasContainer = styled.div<{ w: number, h: number }>`
  position: relative;
  width: ${props => props.w}px;
  height: ${props => props.h}px;
`;

const CanvasWrapper = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  border-top-right-radius: 8px;
  border-top-left-radius: 8px;
  background-color: ${props => props.id === 'graph' ? 'transparent' : props.theme.colors.graphBackground};
`;

export type FilterChanges = {
  frequency?: number,
  gain?: number,
  q?: number,
  type?: BiquadFilterType
};

type Point2D = { x: number, y: number };

type CanvasPlotProps = {
  width: number,
  height: number,
  activeNodeIndex: number|null,
  filters: IFilter[],
  disabled: boolean,
  wheelSensitivity?: number,
  onFilterChanged?: (changes: FilterChanges) => void,
  onHandleSelected?: (index: number) => void,
  onFilterAdded?: (atFrequency: number) => void
};

type CanvasPlotState = {
  dragging: boolean
};

/**
 * This is a class component because hooks don't do well with complex mouse handlers; callback references change,
 * breaking things and complicating dependency mapping.
 */
export class CanvasPlot extends Component<CanvasPlotProps, CanvasPlotState> {
  static contextType: Context<DefaultTheme> = ThemeContext;

  declare context: ContextType<typeof ThemeContext>

  private previousContext: Theme|null = null;

  static defaultProps = {
    width: 750, 
    height: 400
  };

  state: CanvasPlotState = {
    dragging: false
  };

  gridRef = createRef<HTMLCanvasElement>();
  graphRef = createRef<HTMLCanvasElement>();

  filterNodes: BiquadFilterNode[] = [];
  handleLocations: Record<string, Point2D> = {}

  constructor(props: CanvasPlotProps) {
    super(props);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseWheel = this.handleMouseWheel.bind(this);
    this.handleDoubleClick = this.handleDoubleClick.bind(this);
    this.draw = this.draw.bind(this);
    this.drawFrLine = this.drawFrLine.bind(this);
    this.drawGrid = this.drawGrid.bind(this);
  }

  componentDidMount() {
    const grid = this.gridRef.current!;
    const graph = this.graphRef.current!;

    grid.getContext('2d')?.scale(DPR(), DPR());
    graph.getContext('2d')?.scale(DPR(), DPR());

    this.setupCanvasDpr();
    this.syncBiquads(this.props.filters);
    window.requestAnimationFrame(() => {
      this.drawGrid();
      this.draw();
    });
    this.previousContext = this.context;
  }

  componentDidUpdate(prevProps: Readonly<CanvasPlotProps>) {
    if (this.context !== this.previousContext) {
      window.requestAnimationFrame(this.drawGrid);
    }
    this.previousContext = this.context;
    this.syncBiquads(this.props.filters);
    window.requestAnimationFrame(this.draw);
  }

  private setupCanvasDpr() {
    const grid = this.gridRef.current!;
    const graph = this.graphRef.current!;

    grid.style.width = `${this.props.width}px`;
    grid.style.height = `${this.props.height}px`;
    graph.style.width = `${this.props.width}px`;
    graph.style.height = `${this.props.height}px`;
  }

  private syncBiquads(filters: IFilter[]) {
    const nodes: BiquadFilterNode[] = [];
    filters.forEach((f, ix) => {
      const bqf = AUDIO_CONTEXT.createBiquadFilter();
      bqf.frequency.value = f.getFrequency();
      bqf.Q.value = f.getQ();
      bqf.gain.value = f.getGain();
      bqf.type = f.getType();
      if (ix > 0) {
        bqf.connect(nodes[ix - 1]);
      }
      if (ix === filters.length - 1) {
        bqf.connect(AUDIO_CONTEXT.destination);
      }
      nodes.push(bqf);
    });
    this.filterNodes = nodes;
  }


  handleMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    if (this.props.disabled) return;
    const { onHandleSelected } = this.props;
    const { offsetX, offsetY } = e.nativeEvent;
    const node = Object.entries(this.handleLocations).find(p => {
      const { x, y } = p[1];
      const [ xHit, yHit ] = [ x + HANDLE_RADIUS, y + HANDLE_RADIUS ];
      const [ diffX, diffY ] = [ xHit - offsetX, yHit - offsetY ];
      return diffX > 0 && diffY > 0 && diffX < HANDLE_CIRCUMFERENCE && diffY < HANDLE_CIRCUMFERENCE;
    });

    if (node) {
      const nodeIndex = this.props.filters.findIndex(i => i.id === node[0]);
      onHandleSelected?.(nodeIndex);
      const graph = this.graphRef.current;
      if (graph) {
        graph.style.cursor = 'grabbing';
      }
      this.setState(prevState => ({ ...prevState, dragging: true }));
    }
  }

  handleMouseUp() {
    const graph = this.graphRef.current;
    if (graph) {
      graph.style.cursor = '';
    }
    this.setState(prevState => ({ ...prevState, dragging: false }));
  }

  handleMouseMove(e: React.MouseEvent) {
    const { disabled, filters, activeNodeIndex, onFilterChanged } = this.props;
    if (disabled) return;
    const { offsetX, offsetY } = e.nativeEvent;
    if (!offsetX && !offsetY) return; // when mouse stops, these are 0
    if (!this.state.dragging) {
      const hit = Object.values(this.handleLocations).some(p => {
        const { x, y } = p;
        const [ xHit, yHit ] = [ x + HANDLE_RADIUS, y + HANDLE_RADIUS ];
        const [ diffX, diffY ] = [ xHit - offsetX, yHit - offsetY ];
        return diffX > 0 && diffY > 0 && diffX < HANDLE_CIRCUMFERENCE && diffY < HANDLE_CIRCUMFERENCE;
      });
      this.graphRef.current!.style.cursor = hit ? 'grab' : '';
    } else {
      if (activeNodeIndex !== null) {
        const active = filters[activeNodeIndex];
        const m = this.graphRef.current!.width / Math.log10(NYQUIST / FREQ_START);
        const [ adjustedX, adjustedY ] = [ offsetX * DPR(), offsetY * DPR() ];
        const frequency = Math.pow(10, adjustedX / m) * FREQ_START;
        if (active.usesGain()) {
          onFilterChanged?.({ frequency, gain: DB_SCALE * (((-2 * adjustedY) / this.graphRef.current!.height) + 1) });
        } else {
          onFilterChanged?.({ frequency });
        }
      }
    }
  }

  handleMouseWheel(e: React.WheelEvent) { 
    const { disabled, wheelSensitivity = 2048, filters, activeNodeIndex, onFilterChanged } = this.props;
    if (disabled) return;
    const active = activeNodeIndex !== null ? filters[activeNodeIndex] : null;
    if (active && active.usesQ()) {
      const q = Math.max(0, Math.min(active.getQ() - e.deltaY / (wheelSensitivity / 10), 10));
      onFilterChanged?.({ q });
    }
  }

  handleDoubleClick(e: React.MouseEvent) {
    e.preventDefault();
    const adjustedX = e.nativeEvent.offsetX * DPR();
    const m = this.graphRef.current!.width / Math.log10(NYQUIST / FREQ_START);
    const frequency = Math.pow(10, adjustedX / m) * FREQ_START;
    this.props.onFilterAdded?.(frequency);
  }

  private drawGrid() {
    const grid = this.gridRef.current;
    if (!grid) return;
    const gridCtx = grid.getContext('2d')!;
    const { width, height } = this.props;
    gridCtx.clearRect(0, 0, width, height);

    const colors = this.context.colors;

    // draw frequency lines
    gridCtx.font = '8px sans-serif';

    const m = width / Math.log10(NYQUIST / FREQ_START);
    for (let i = 1, j = FREQ_START; j < NYQUIST; ++i, j = Math.pow(10, i)) {
      [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(p => {
        if (i <= 1 && p === 1) return;
        let x = Math.floor(m * Math.log10(p * j / FREQ_START)) + 0.5;
        gridCtx.beginPath();
        gridCtx.lineWidth = 1;
        gridCtx.strokeStyle = p === 1 ? colors.graphLineMarker : colors.graphLine;
        gridCtx.moveTo(x, 0);
        gridCtx.lineTo(x, height);
        gridCtx.stroke();
      });
    }

    // draw text for frequency
    Object.entries(FREQ_LINES).forEach(j => {
      let x = m * Math.log10(j[1] / FREQ_START);
      gridCtx.lineWidth = 0.5;
      gridCtx.textAlign = 'center';
      gridCtx.fillStyle = colors.graphText;
      gridCtx.fillText(j[0], Math.floor(x) + 10.5, height - 2.5);
    });

    // draw decibel lines
    for (let db = -DB_SCALE + 5; db < DB_SCALE; db += 5) {
      const dbToY = (0.5 * height) - ((0.5 * height) / DB_SCALE) * db;
      const y = Math.floor(dbToY) + 0.5; // adjustment for crisp lines
      gridCtx.strokeStyle = db === 0 ? colors.graphLineMarker : colors.graphLine;
      gridCtx.beginPath();
      gridCtx.moveTo(0, y);
      gridCtx.lineTo(width, y);
      gridCtx.stroke();
      gridCtx.fillStyle = colors.graphText;
      gridCtx.fillText(db.toFixed(0), 10.5, y + 0.5);
    }
  }

  private drawFrLine(): number[] {
    const graph = this.graphRef.current;
    if (!graph) return [];
    const { width, height } = this.props;
    const graphCtx = graph.getContext('2d')!;

    const { filters, disabled } = this.props;

    const theme = this.context;

    const mVal = width / Math.log10(NYQUIST / FREQ_START);
    
    graphCtx.clearRect(0, 0, width, height);

    const freqHz = new Float32Array(width);
    for (let x = 0; x < width; ++x) {
      freqHz[x] = Math.pow(10, (x / mVal)) * FREQ_START;
    }

    const magRes: Float32Array[] = [];
    filters.forEach((f, ix) => {
      const filterNode = this.filterNodes[ix];
      filterNode.frequency.value = f.getFrequency();
      filterNode.gain.value = f.getGain();
      filterNode.Q.value = f.getQ();
      filterNode.type = f.getType();
      const mr = new Float32Array(width);
      filterNode.getFrequencyResponse(freqHz, mr, new Float32Array(width));
      magRes.push(mr);
    });

    graphCtx.beginPath();
    graphCtx.lineWidth = 2;
    graphCtx.strokeStyle = disabled ? theme.colors.disabled : theme.colors.freqResponseLine;

    const yVals = [];
    for (let i = 0; i < width; ++i) {
      const response = magRes.reduce((a, c) => a * c[i], 1);
      const dbResponse = 20.0 * Math.log10(Math.abs(response) || 1);
      const y = (0.5 * height) * (1 - dbResponse / DB_SCALE);
      if (i === 0) {
        graphCtx.moveTo(i, y);
      } else {
        graphCtx.lineTo(i, y);
      }
      yVals.push(y);
    }
    graphCtx.stroke();

    return yVals;
  }

  private drawHandles(yVals: number[]) {
    const graph = this.graphRef.current;
    if (!graph) return;
    const { width, height } = this.props;
    const graphCtx = graph.getContext('2d')!;
    const mVal = width / Math.log10(NYQUIST / FREQ_START);
    const newHandleLocations: Record<string, Point2D> = {};
    const { filters, disabled, activeNodeIndex } = this.props;
    const theme = this.context;
    filters.forEach((f, ix) => {
      const buffer = 0;
      const x = Math.floor(mVal * Math.log10(f.getFrequency() / FREQ_START));
      const y = (f.usesGain() ? Math.min(Math.max(10, yVals[x]), height + buffer) : height * 0.5) - buffer;
      const active = ix === activeNodeIndex;

      graphCtx.strokeStyle = disabled ? theme.colors.disabled : (active ? theme.colors.accentPrimary : darken(theme.colors.accentPrimary, 0.1));
      graphCtx.lineWidth = 3;
      graphCtx.beginPath();
      const r = active ? SELECTED_HANDLE_RADIUS : HANDLE_RADIUS;
      graphCtx.arc(x, y, r, 0, TWO_PI);
      graphCtx.stroke();

      if (active) {
        graphCtx.fillStyle = disabled ? theme.colors.disabled : theme.colors.accentPrimary;
        graphCtx.fill();
        graphCtx.beginPath();
        graphCtx.arc(x, y, r, 0, TWO_PI);
        graphCtx.filter = active ? 'blur(16px)' : 'none';
        graphCtx.fill();
        graphCtx.fillStyle = theme.colors.background;
        graphCtx.filter = 'none';
      } else {
        graphCtx.fillStyle = disabled ? theme.colors.disabled : theme.colors.accentPrimary;
      }

      newHandleLocations[f.id] = { x, y };
    });
    this.handleLocations = newHandleLocations;
  }

  private draw() {
    const graph = this.graphRef.current;
    if (!graph) return;
    const yVals = this.drawFrLine();
    this.drawHandles(yVals);
  }

  render() {
    const { width, height } = this.props;
    return (
      <CanvasContainer w={width} h={height}>
        <CanvasWrapper
          id="grid"
          ref={this.gridRef}
          width={`${DPR() * width}px`}
          height={`${DPR() * height}px`}
        />
        <CanvasWrapper
          id="graph"
          ref={this.graphRef}
          width={`${DPR() * width}px`}
          height={`${DPR() * height}px`}
          onMouseDown={this.handleMouseDown}
          onMouseUp={this.handleMouseUp}
          onMouseMove={this.handleMouseMove}
          onWheel={this.handleMouseWheel}
          onDoubleClick={this.handleDoubleClick}
        />
      </CanvasContainer>
    );
  }
}
