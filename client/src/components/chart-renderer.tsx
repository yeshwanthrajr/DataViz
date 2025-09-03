import { useQuery } from "@tanstack/react-query";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { apiRequest } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface Chart {
  id: string;
  title: string;
  type: string;
  xAxis: string;
  yAxis: string;
  fileId: string;
  config: any;
}

interface File {
  id: string;
  data: any[];
}

interface ChartRendererProps {
  chart: Chart;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ChartRenderer({ chart }: ChartRendererProps) {
  const { toast } = useToast();

  // Fetch file data
  const { data: file, isLoading, error } = useQuery<File>({
    queryKey: [`/api/files/${chart.fileId}`],
    queryFn: () => apiRequest("GET", `/api/files/${chart.fileId}`).then(res => res.json()),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>Unable to load chart data</p>
      </div>
    );
  }

  // Prepare chart data
  const chartData = file.data.map((row, index) => {
    const xValue = row[chart.xAxis] || `Item ${index + 1}`;
    const yValue = parseFloat(row[chart.yAxis]) || 0;

    return {
      ...row,
      [chart.xAxis]: xValue,
      [chart.yAxis]: yValue,
      name: xValue, // Add name property for pie chart
    };
  });

  const chartConfig = {
    [chart.yAxis]: {
      label: chart.yAxis,
      color: "hsl(var(--chart-1))",
    },
    [chart.xAxis]: {
      label: chart.xAxis,
      color: "hsl(var(--chart-1))",
    },
    primary: {
      label: "Primary",
      color: "hsl(var(--chart-1))",
    },
  };

  const renderChart = () => {
    switch (chart.type) {
      case 'bar':
        return (
          <ChartContainer config={chartConfig} className="h-64">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey={chart.xAxis}
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey={chart.yAxis}
                fill="var(--color-chart-yAxis)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        );

      case 'line':
        return (
          <ChartContainer config={chartConfig} className="h-64">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey={chart.xAxis}
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey={chart.yAxis}
                stroke="var(--color-chart-yAxis)"
                strokeWidth={2}
                dot={{ fill: "var(--color-chart-yAxis)", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ChartContainer>
        );

      case 'pie':
        return (
          <ChartContainer config={chartConfig} className="h-64">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey={chart.yAxis}
                nameKey={chart.xAxis}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
        );

      case '3d':
        return (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>3D charts are not yet implemented</p>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>Chart type "{chart.type}" not supported</p>
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4 text-center">{chart.title}</h3>
      {renderChart()}
    </div>
  );
}