import React, { useState, useEffect } from 'react';
import axios from 'axios';

function JenkinsInfo() {
  const [serverStatus, setServerStatus] = useState('checking');
  const [buildInfo, setBuildInfo] = useState(null);

  useEffect(() => {
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    try {
      const response = await axios.get('/api/health');
      setServerStatus('online');
      setBuildInfo(response.data);
    } catch (error) {
      setServerStatus('offline');
    }
  };

  return (
    <div className="jenkins-info">
      <h3>🚀 Jenkins Learning Journey</h3>
      
      <div>
        <h4>
          <span className={`status-indicator ${serverStatus === 'online' ? 'status-online' : 'status-offline'}`}></span>
          Backend Status: {serverStatus}
        </h4>
        {buildInfo && (
          <div>
            <p><strong>Environment:</strong> {buildInfo.environment}</p>
            <p><strong>Build:</strong> {buildInfo.version}</p>
            <p><strong>Last Updated:</strong> {new Date(buildInfo.timestamp).toLocaleString()}</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <h4>Next Steps for Jenkins Learning:</h4>
        <ul style={{ textAlign: 'left' }}>
          <li>Set up Jenkins locally using Docker</li>
          <li>Create your first Pipeline job</li>
          <li>Configure automated builds on Git commits</li>
          <li>Add testing stages to your pipeline</li>
          <li>Implement deployment automation</li>
          <li>Set up monitoring and notifications</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>
          💡 <strong>Tip:</strong> Each time you commit code, Jenkins will automatically build and test your application!
        </p>
      </div>
    </div>
  );
}

export default JenkinsInfo;