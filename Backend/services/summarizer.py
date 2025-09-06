"""
Patient Data Summarizer Module

This module provides functionality to generate human-readable summaries of patient vitals
and anomalies over a selected time range using Gemini LLM.

Usage:
    from services.summarizer import summarize_patient_data
    
    # Patient data as list of dictionaries
    patient_data = [
        {
            'timestamp': '2025-09-06 10:30:00',
            'heart_rate': 75,
            'bp_sys': 120,
            'bp_dia': 80,
            'spo2': 98,
            'temp': 37.0,
            'ecg': 2,
            'rule_flag': 0,
            'ewma_flag': 0,
            'iforest_flag': 0,
            'risk_score': 0.2
        },
        # ... more records
    ]
    
    summary = summarize_patient_data(patient_data)
    print(summary)

Author: Pixel Pioneers Team
"""

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import statistics
import json


class GeminiClient:
        def __init__(self, api_key: str):
            self.api_key = api_key
        
        def generate_content(self, prompt: str) -> str:
            return "LLM service unavailable - please configure Gemini API"

# Configure logging
logger = logging.getLogger(__name__)

class VitalTrendAnalyzer:
    """Helper class to analyze trends in vital signs"""
    
    @staticmethod
    def calculate_trend(values: List[float], time_window: int = 10) -> str:
        """
        Calculate trend direction for a list of values
        
        Args:
            values: List of numerical values (e.g., heart rates)
            time_window: Number of recent values to consider for trend
            
        Returns:
            String describing trend: 'increasing', 'decreasing', 'stable', 'fluctuating'
        """
        if len(values) < 3:
            return 'insufficient_data'
        
        # Use recent values for trend analysis
        recent_values = values[-min(time_window, len(values)):]
        
        if len(recent_values) < 3:
            return 'stable'
        
        # Calculate linear trend using simple slope
        n = len(recent_values)
        x_vals = list(range(n))
        
        # Simple linear regression slope calculation
        x_mean = sum(x_vals) / n
        y_mean = sum(recent_values) / n
        
        numerator = sum((x_vals[i] - x_mean) * (recent_values[i] - y_mean) for i in range(n))
        denominator = sum((x_vals[i] - x_mean) ** 2 for i in range(n))
        
        if denominator == 0:
            return 'stable'
        
        slope = numerator / denominator
        
        # Calculate variance to detect fluctuation
        variance = statistics.variance(recent_values)
        avg_value = statistics.mean(recent_values)
        coefficient_of_variation = (variance ** 0.5) / avg_value if avg_value > 0 else 0
        
        # Trend classification thresholds
        slope_threshold = avg_value * 0.02  # 2% of average value
        fluctuation_threshold = 0.15  # 15% coefficient of variation
        
        if coefficient_of_variation > fluctuation_threshold:
            return 'fluctuating'
        elif slope > slope_threshold:
            return 'increasing'
        elif slope < -slope_threshold:
            return 'decreasing'
        else:
            return 'stable'

class PatientDataProcessor:
    """Process raw patient data into structured insights"""
    
    def __init__(self):
        self.trend_analyzer = VitalTrendAnalyzer()
    
    def process_patient_data(self, patient_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Process patient data into structured insights for LLM summarization
        
        Args:
            patient_data: List of patient vital records with timestamps
            
        Returns:
            Dictionary containing processed insights and statistics
        """
        if not patient_data:
            return {"error": "No patient data provided"}
        
        # Sort data by timestamp
        sorted_data = sorted(patient_data, key=lambda x: x.get('timestamp', ''))
        
        insights = {
            "time_range": self._get_time_range(sorted_data),
            "total_records": len(sorted_data),
            "vital_trends": self._analyze_vital_trends(sorted_data),
            "anomaly_analysis": self._analyze_anomalies(sorted_data),
            "critical_events": self._identify_critical_events(sorted_data),
            "vital_statistics": self._calculate_vital_statistics(sorted_data)
        }
        
        return insights
    
    def _get_time_range(self, data: List[Dict]) -> Dict[str, str]:
        """Extract time range from data"""
        if not data:
            return {"start": "N/A", "end": "N/A", "duration": "N/A"}
        
        start_time = data[0].get('timestamp', 'N/A')
        end_time = data[-1].get('timestamp', 'N/A')
        
        try:
            start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
            end_dt = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
            duration = str(end_dt - start_dt)
        except:
            duration = "N/A"
        
        return {
            "start": start_time,
            "end": end_time,
            "duration": duration
        }
    
    def _analyze_vital_trends(self, data: List[Dict]) -> Dict[str, str]:
        """Analyze trends for each vital sign"""
        vitals = ['heart_rate', 'bp_sys', 'bp_dia', 'spo2', 'temp', 'ecg']
        trends = {}
        
        for vital in vitals:
            values = [record.get(vital) for record in data if record.get(vital) is not None]
            if values:
                trends[vital] = self.trend_analyzer.calculate_trend(values)
            else:
                trends[vital] = 'no_data'
        
        return trends
    
    def _analyze_anomalies(self, data: List[Dict]) -> Dict[str, Any]:
        """Analyze anomaly patterns and frequencies"""
        anomaly_flags = ['rule_flag', 'ewma_flag', 'iforest_flag']
        anomaly_counts = {flag: 0 for flag in anomaly_flags}
        risk_scores = []
        
        total_alerts = 0
        high_risk_events = 0
        
        for record in data:
            # Count anomaly flags
            for flag in anomaly_flags:
                if record.get(flag) == 1:
                    anomaly_counts[flag] += 1
            
            # Analyze risk scores
            risk_score = record.get('risk_score', 0)
            if risk_score is not None:
                risk_scores.append(risk_score)
                if risk_score > 0.7:
                    total_alerts += 1
                if risk_score > 0.9:
                    high_risk_events += 1
        
        # Find most frequent anomaly type
        most_frequent_anomaly = max(anomaly_counts, key=anomaly_counts.get) if any(anomaly_counts.values()) else None
        
        return {
            "total_alerts": total_alerts,
            "high_risk_events": high_risk_events,
            "anomaly_counts": anomaly_counts,
            "most_frequent_anomaly": most_frequent_anomaly,
            "avg_risk_score": statistics.mean(risk_scores) if risk_scores else 0,
            "max_risk_score": max(risk_scores) if risk_scores else 0
        }
    
    def _identify_critical_events(self, data: List[Dict]) -> List[Dict]:
        """Identify critical events requiring immediate attention"""
        critical_events = []
        
        for record in data:
            risk_score = record.get('risk_score', 0)
            timestamp = record.get('timestamp', 'Unknown')
            
            if risk_score and risk_score > 0.9:
                event = {
                    "timestamp": timestamp,
                    "risk_score": risk_score,
                    "vitals": {
                        "heart_rate": record.get('heart_rate'),
                        "bp_sys": record.get('bp_sys'),
                        "bp_dia": record.get('bp_dia'),
                        "spo2": record.get('spo2'),
                        "temp": record.get('temp')
                    }
                }
                critical_events.append(event)
        
        return critical_events[:5]  # Return top 5 critical events
    
    def _calculate_vital_statistics(self, data: List[Dict]) -> Dict[str, Dict]:
        """Calculate basic statistics for each vital sign"""
        vitals = ['heart_rate', 'bp_sys', 'bp_dia', 'spo2', 'temp', 'ecg']
        stats = {}
        
        for vital in vitals:
            values = [record.get(vital) for record in data if record.get(vital) is not None]
            if values:
                stats[vital] = {
                    "min": min(values),
                    "max": max(values),
                    "avg": round(statistics.mean(values), 1),
                    "count": len(values)
                }
            else:
                stats[vital] = {"min": None, "max": None, "avg": None, "count": 0}
        
        return stats

class LLMSummarizer:
    """Handle LLM interaction for generating natural language summaries"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize LLM client
        
        Args:
            api_key: Gemini API key (optional, can be set via environment)
        """
        self.client = GeminiClient(api_key or "default_key")
    
    def generate_summary_prompt(self, insights: Dict[str, Any]) -> str:
        """
        Generate a structured prompt for LLM summarization
        
        Args:
            insights: Processed patient data insights
            
        Returns:
            Formatted prompt string for LLM
        """
        prompt = f"""
You are a medical AI assistant helping doctors understand patient vital sign data. Generate a concise, professional summary of the patient's condition based on the following data:

**Time Period:** {insights['time_range']['start']} to {insights['time_range']['end']} 
**Duration:** {insights['time_range']['duration']}
**Total Records:** {insights['total_records']}

**VITAL SIGN TRENDS:**
"""
        
        # Add vital trends
        trend_descriptions = {
            'increasing': 'trending upward',
            'decreasing': 'trending downward', 
            'stable': 'stable',
            'fluctuating': 'showing fluctuations',
            'no_data': 'no data available'
        }
        
        for vital, trend in insights['vital_trends'].items():
            vital_name = vital.replace('_', ' ').title()
            trend_desc = trend_descriptions.get(trend, trend)
            stats = insights['vital_statistics'].get(vital, {})
            avg = stats.get('avg', 'N/A')
            
            prompt += f"- {vital_name}: {trend_desc} (Average: {avg})\n"
        
        # Add anomaly analysis
        anomaly_data = insights['anomaly_analysis']
        prompt += f"""
**ALERTS & ANOMALIES:**
- Total Alerts Triggered: {anomaly_data['total_alerts']}
- High Risk Events: {anomaly_data['high_risk_events']}
- Average Risk Score: {anomaly_data['avg_risk_score']:.2f}
- Maximum Risk Score: {anomaly_data['max_risk_score']:.2f}

**ANOMALY DETECTION BREAKDOWN:**
- Rule-based alerts: {anomaly_data['anomaly_counts']['rule_flag']}
- Trend-based alerts: {anomaly_data['anomaly_counts']['ewma_flag']}
- ML pattern alerts: {anomaly_data['anomaly_counts']['iforest_flag']}
"""
        
        # Add critical events if any
        if insights['critical_events']:
            prompt += "\n**CRITICAL EVENTS:**\n"
            for event in insights['critical_events']:
                prompt += f"- {event['timestamp']}: Risk Score {event['risk_score']:.2f}\n"
        
        prompt += """
Please provide a summary that includes:
1. Overall patient condition assessment
2. Key vital sign patterns and any concerning trends  
3. Alert frequency and severity analysis
4. Clinical recommendations or areas requiring attention
5. Any notable patterns or anomalies detected

Keep the summary professional, concise (150-200 words), and suitable for medical professionals."""
        
        return prompt
    
    def get_llm_summary(self, prompt: str) -> str:
        """
        Get summary from Gemini REST API
        
        Args:
            prompt: Formatted prompt for LLM
            
        Returns:
            Generated summary text
        """
        if not self.api_key:
            logger.error("Gemini API key not provided")
            return "AI summary unavailable - please check Gemini API key configuration"
        
        try:
            # Prepare request payload matching your curl format
            payload = {
                "contents": [
                    {
                        "parts": [
                            {
                                "text": prompt
                            }
                        ]
                    }
                ]
            }
            
            # Make POST request to Gemini API
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json=payload,
                timeout=30  # 30 second timeout
            )
            
            # Check if request was successful
            if response.status_code == 200:
                result = response.json()
                
                # Extract text from Gemini response format
                if 'candidates' in result and len(result['candidates']) > 0:
                    candidate = result['candidates'][0]
                    if 'content' in candidate and 'parts' in candidate['content']:
                        parts = candidate['content']['parts']
                        if len(parts) > 0 and 'text' in parts[0]:
                            return parts[0]['text']
                
                logger.error("Unexpected response format from Gemini API")
                return "Error: Unexpected response format from AI service"
            
            else:
                logger.error(f"Gemini API error: {response.status_code} - {response.text}")
                return f"AI service error: {response.status_code}"
                
        except requests.exceptions.Timeout:
            logger.error("Gemini API request timed out")
            return "AI summary unavailable - request timeout"
        except requests.exceptions.RequestException as e:
            logger.error(f"Network error calling Gemini API: {e}")
            return f"Network error: {str(e)}"
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing Gemini API response: {e}")
            return "Error parsing AI response"
        except Exception as e:
            logger.error(f"Unexpected error calling Gemini API: {e}")
            return f"Unexpected error: {str(e)}"

def summarize_patient_data(patient_data: List[Dict[str, Any]], api_key: Optional[str] = None) -> str:
    """
    Generate a human-readable summary of patient vitals and anomalies using Gemini LLM
    
    This function processes patient vital signs data over a time range and generates
    a natural language summary including trends, anomalies, and clinical insights.
    
    Args:
        patient_data: List of dictionaries containing patient vital records.
                     Each dictionary should contain:
                     - timestamp (str): ISO format timestamp
                     - heart_rate (float): Heart rate in BPM
                     - bp_sys (float): Systolic blood pressure
                     - bp_dia (float): Diastolic blood pressure  
                     - spo2 (float): Oxygen saturation percentage
                     - temp (float): Body temperature in Celsius
                     - ecg (float): ECG irregularity score
                     - rule_flag (int): Rule-based anomaly flag (0/1)
                     - ewma_flag (int): Trend-based anomaly flag (0/1)
                     - iforest_flag (int): ML-based anomaly flag (0/1)
                     - risk_score (float): Combined risk score (0-1)
        
        api_key: Optional Gemini API key (can be set via environment)
    
    Returns:
        str: Natural language summary of patient condition and vitals
        
    Raises:
        ValueError: If patient_data is empty or invalid
        
    Example:
        >>> patient_data = [
        ...     {
        ...         'timestamp': '2025-09-06 10:00:00',
        ...         'heart_rate': 75, 'bp_sys': 120, 'bp_dia': 80,
        ...         'spo2': 98, 'temp': 37.0, 'ecg': 2,
        ...         'rule_flag': 0, 'ewma_flag': 0, 'iforest_flag': 0,
        ...         'risk_score': 0.2
        ...     }
        ... ]
        >>> summary = summarize_patient_data(patient_data)
        >>> print(summary)
    """
    
    # Input validation
    if not patient_data:
        raise ValueError("Patient data cannot be empty")
    
    if not isinstance(patient_data, list):
        raise ValueError("Patient data must be a list of dictionaries")
    
    # Log the summarization request
    logger.info(f"Generating summary for {len(patient_data)} patient records")
    
    try:
        # Process patient data into insights
        processor = PatientDataProcessor()
        insights = processor.process_patient_data(patient_data)
        
        if "error" in insights:
            return f"Error processing patient data: {insights['error']}"
        
        # Generate LLM summary
        summarizer = LLMSummarizer(api_key)
        prompt = summarizer.generate_summary_prompt(insights)
        summary = summarizer.get_llm_summary(prompt)
        
        logger.info("Patient data summary generated successfully")
        return summary
        
    except Exception as e:
        error_msg = f"Error generating patient summary: {str(e)}"
        logger.error(error_msg)
        return error_msg

def create_fallback_summary(patient_data: List[Dict[str, Any]]) -> str:
    """
    Create a basic summary without LLM in case of API failure
    
    Args:
        patient_data: List of patient vital records
        
    Returns:
        Basic text summary of the data
    """
    if not patient_data:
        return "No patient data available for summary."
    
    processor = PatientDataProcessor()
    insights = processor.process_patient_data(patient_data)
    
    summary_lines = [
        f"Patient Data Summary ({len(patient_data)} records)",
        f"Time Range: {insights['time_range']['start']} to {insights['time_range']['end']}",
        f"Total Alerts: {insights['anomaly_analysis']['total_alerts']}",
        f"High Risk Events: {insights['anomaly_analysis']['high_risk_events']}",
        "",
        "Vital Sign Averages:"
    ]
    
    for vital, stats in insights['vital_statistics'].items():
        if stats['avg'] is not None:
            vital_name = vital.replace('_', ' ').title()
            summary_lines.append(f"- {vital_name}: {stats['avg']}")
    
    if insights['critical_events']:
        summary_lines.append(f"\nCritical Events: {len(insights['critical_events'])}")
    
    return "\n".join(summary_lines)