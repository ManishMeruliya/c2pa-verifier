import { useState } from "react";
import Card from "./Card";
import Badge from "./Badge";
import Icon from "./Icon";
import Button from "./Button";
import JsonViewer from "./JsonViewer";

const ResultDisplay = ({ result, className = "" }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!result) return null;

  if (result.error) {
    return (
      <Card className={`${className} shadow-sm border-0 bg-white`}>
        <Card.Content className="p-8">
          <div className="flex items-center space-x-5">
            <div className="w-14 h-14 bg-red-50 border-2 border-red-200 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
              <Icon name="error" className="w-7 h-7 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-red-900 mb-2">
                Verification Failed
              </h3>
              <p className="text-red-700 text-lg">{result.error}</p>
            </div>
          </div>
        </Card.Content>
      </Card>
    );
  }

  const hasValidC2PA = result.hasC2PAData === true;
  const statusColor = hasValidC2PA ? "success" : "warning";
  const statusText = hasValidC2PA ? "C2PA Data Found" : (result.status || "No C2PA Data");

  return (
    <Card className={`${className} shadow-sm border-0 bg-white`}>
      <Card.Content className="p-6">
        <div className="space-y-6">
          {/* Status Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${
                hasValidC2PA ? "bg-emerald-50 border-2 border-emerald-200" : "bg-amber-50 border-2 border-amber-200"
              }`}>
                <Icon 
                  name={hasValidC2PA ? "check" : "info"} 
                  className={`w-6 h-6 ${hasValidC2PA ? "text-emerald-600" : "text-amber-600"}`} 
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  Verification Complete
                </h3>
                <p className="text-gray-600 text-base">
                  {hasValidC2PA 
                    ? "C2PA metadata successfully extracted" 
                    : "No C2PA metadata detected in this image"
                  }
                </p>
              </div>
            </div>
            <Badge 
              variant={statusColor} 
              size="lg" 
              className={`px-4 py-2 text-sm font-semibold ${
                hasValidC2PA 
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200" 
                  : "bg-amber-100 text-amber-800 border-amber-200"
              }`}
            >
              {statusText}
            </Badge>
          </div>


          {/* Detailed Results */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-gray-900">
                  JSON Response
                </h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className={`w-4 h-4 mr-2 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {isExpanded ? "Hide JSON" : "Show JSON"}
              </Button>
            </div>
            
            {isExpanded && (
              <div className="mt-4">
                <JsonViewer data={result} />
              </div>
            )}
          </div>
        </div>
      </Card.Content>
    </Card>
  );
};

export default ResultDisplay;
