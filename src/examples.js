// D2 Example Snippets Library

export const examples = [
  {
    name: 'Simple Flow',
    code: `# A simple flow diagram
User -> Web Server: HTTP Request
Web Server -> Database: Query
Database -> Web Server: Results
Web Server -> User: Response
`
  },
  {
    name: 'Architecture',
    code: `# Cloud Architecture

Cloud: {
  Web Tier: {
    LB: Load Balancer {
      shape: diamond
    }
    App1: App Server 1
    App2: App Server 2

    LB -> App1
    LB -> App2
  }

  Data Tier: {
    Primary: PostgreSQL Primary {
      shape: cylinder
    }
    Replica: PostgreSQL Replica {
      shape: cylinder
    }
    Cache: Redis Cache {
      shape: hexagon
    }

    Primary -> Replica: Replication
  }

  Web Tier.App1 -> Data Tier.Primary: Read/Write
  Web Tier.App2 -> Data Tier.Primary: Read/Write
  Web Tier.App1 -> Data Tier.Cache: Cache Lookup
  Web Tier.App2 -> Data Tier.Cache: Cache Lookup
}

Users -> Cloud.Web Tier.LB: HTTPS
`
  },
  {
    name: 'Sequence Diagram',
    code: `# Authentication Sequence

shape: sequence_diagram

Client -> Auth Server: Login Request
Auth Server -> Database: Validate Credentials
Database -> Auth Server: User Record
Auth Server -> Auth Server: Generate JWT
Auth Server -> Client: JWT Token

Client -> API Server: Request + JWT
API Server -> Auth Server: Verify Token
Auth Server -> API Server: Token Valid
API Server -> Client: Protected Resource
`
  },
  {
    name: 'Class Diagram',
    code: `# Object-Oriented Design

Animal: {
  shape: class
  +name: string
  +age: int
  +speak(): string
  +move(): void
}

Dog: {
  shape: class
  +breed: string
  +fetch(): void
  +speak(): string
}

Cat: {
  shape: class
  +indoor: bool
  +purr(): void
  +speak(): string
}

Bird: {
  shape: class
  +wingspan: float
  +fly(): void
  +speak(): string
}

Animal -> Dog: extends
Animal -> Cat: extends
Animal -> Bird: extends
`
  },
  {
    name: 'Grid Layout',
    code: `# Dashboard Grid Layout

grid-rows: 3
grid-columns: 3

Header: {
  grid-row: 1
  grid-column: 1/4
  style.fill: "#4f46e5"
  style.font-color: "#ffffff"
}

Sidebar: {
  grid-row: 2/4
  grid-column: 1
  style.fill: "#1e1e32"
  style.font-color: "#e8e8f0"
}

Main Content: {
  grid-row: 2
  grid-column: 2/4
  style.fill: "#f0f0ff"
}

Charts: {
  grid-row: 3
  grid-column: 2
  style.fill: "#e8f5e9"
}

Stats: {
  grid-row: 3
  grid-column: 3
  style.fill: "#fff3e0"
}
`
  },
  {
    name: 'Network Topology',
    code: `# Network Topology

Internet: {
  shape: cloud
}

Firewall: {
  shape: hexagon
  style.fill: "#e53e3e"
  style.font-color: "#fff"
}

DMZ: {
  Web Server: {
    shape: rectangle
  }
  DNS: {
    shape: rectangle
  }
}

Internal Network: {
  App Server: {
    shape: rectangle
  }
  File Server: {
    shape: rectangle
  }
  DB Server: {
    shape: cylinder
  }

  App Server -> DB Server: SQL
  App Server -> File Server: NFS
}

Internet -> Firewall
Firewall -> DMZ
DMZ -> Internal Network
`
  },
  {
    name: 'CI/CD Pipeline',
    code: `# CI/CD Pipeline

Developer: {
  shape: person
}

Source Control: {
  GitHub: {
    shape: rectangle
  }
}

CI Pipeline: {
  Build: {
    style.fill: "#3b82f6"
    style.font-color: "#fff"
  }
  Test: {
    Unit Tests
    Integration Tests
    style.fill: "#8b5cf6"
    style.font-color: "#fff"
  }
  Security Scan: {
    style.fill: "#f59e0b"
    style.font-color: "#fff"
  }

  Build -> Test
  Test -> Security Scan
}

CD Pipeline: {
  Staging: {
    style.fill: "#06b6d4"
    style.font-color: "#fff"
  }
  Approval: {
    shape: diamond
    style.fill: "#f97316"
    style.font-color: "#fff"
  }
  Production: {
    style.fill: "#10b981"
    style.font-color: "#fff"
  }

  Staging -> Approval: Manual Gate
  Approval -> Production: Approved
}

Developer -> Source Control.GitHub: Push
Source Control.GitHub -> CI Pipeline.Build: Webhook
CI Pipeline.Security Scan -> CD Pipeline.Staging: Deploy
`
  },
  {
    name: 'Styled Diagram',
    code: `# Styled Microservices

API Gateway: {
  style.fill: "#6366f1"
  style.font-color: "#ffffff"
  style.border-radius: 8
  style.shadow: true
}

Auth Service: {
  style.fill: "#8b5cf6"
  style.font-color: "#ffffff"
  style.border-radius: 8
}

User Service: {
  style.fill: "#06b6d4"
  style.font-color: "#ffffff"
  style.border-radius: 8
}

Order Service: {
  style.fill: "#10b981"
  style.font-color: "#ffffff"
  style.border-radius: 8
}

Payment Service: {
  style.fill: "#f59e0b"
  style.font-color: "#ffffff"
  style.border-radius: 8
}

Message Queue: {
  shape: queue
  style.fill: "#ef4444"
  style.font-color: "#ffffff"
}

Database: {
  shape: cylinder
  style.fill: "#1e1e32"
  style.font-color: "#e8e8f0"
  style.shadow: true
}

API Gateway -> Auth Service: Verify {
  style.stroke: "#8b5cf6"
}
API Gateway -> User Service {
  style.stroke: "#06b6d4"
}
API Gateway -> Order Service {
  style.stroke: "#10b981"
}
Order Service -> Payment Service: Process {
  style.stroke: "#f59e0b"
}
Order Service -> Message Queue: Publish {
  style.stroke: "#ef4444"
}
User Service -> Database
Order Service -> Database
Payment Service -> Database
`
  }
];
