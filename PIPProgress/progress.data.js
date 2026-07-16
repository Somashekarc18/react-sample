window.__PIP_DATA__ = {
  "schemaVersion": "1.0.0",
  "meta": {
    "title": "PIP Progress Tracker",
    "owner": "Somashekar",
    "periodStart": "2026-07-15",
    "periodEnd": "2026-10-15",
    "lastUpdated": "2026-07-16"
  },
  "checkpoints": [
    { "id": "cp1", "date": "2026-07-15", "label": "Jul 15 (Baseline)" },
    { "id": "cp2", "date": "2026-07-29", "label": "Jul 29" },
    { "id": "cp3", "date": "2026-08-12", "label": "Aug 12" },
    { "id": "cp4", "date": "2026-08-26", "label": "Aug 26" },
    { "id": "cp5", "date": "2026-09-09", "label": "Sep 09" },
    { "id": "cp6", "date": "2026-09-23", "label": "Sep 23" },
    { "id": "cp7", "date": "2026-10-07", "label": "Oct 07" },
    { "id": "cp8", "date": "2026-10-15", "label": "Oct 15 (Due)" }
  ],
  "goals": [
    {
      "id": "goal-aws-cert",
      "title": "Level 3 Certification: AWS Certified Generative AI Developer - Professional",
      "outcome": "Attain a Level 3 Professional / Advanced cloud certification (AIP-C01).",
      "dueDate": "2026-10-15",
      "weight": 1,
      "status": "in-progress",
      "placeholder": false,
      "source": "https://aws.amazon.com/certification/certified-generative-ai-developer-professional/",
      "notes": "180 min, 75 questions (65 scored), $300, passing score 750/1000. Sub-goals map to the 5 exam domains weighted by exam percentage, plus exam-prep logistics.",
      "subGoals": [
        {
          "id": "sg-prep",
          "title": "Exam Prep & Logistics",
          "weight": 10,
          "tasks": [
            { "id": "t-guide", "title": "Review official AIP-C01 exam guide (domains, tasks, skills)", "estHours": 3, "resourceUrl": "https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01.html", "progressByCheckpoint": { "cp1": 0 } },
            { "id": "t-skillbuilder", "title": "Enroll in AWS Skill Builder 4-step Exam Prep Plan", "estHours": 2, "resourceUrl": "https://skillbuilder.aws/category/exam-prep/generative-ai-developer-professional-AIP-C01", "progressByCheckpoint": { "cp1": 0 } },
            { "id": "t-practice", "title": "Complete Official Practice Question Set", "estHours": 4, "resourceUrl": "https://skillbuilder.aws/", "progressByCheckpoint": { "cp1": 0 } },
            { "id": "t-pretest", "title": "Take Official Pretest and assess readiness", "estHours": 3, "resourceUrl": "https://skillbuilder.aws/", "progressByCheckpoint": { "cp1": 0 } },
            { "id": "t-schedule", "title": "Schedule and sit the exam (Pearson VUE / online proctored)", "estHours": 4, "resourceUrl": "https://www.aws.training/certification", "progressByCheckpoint": { "cp1": 0 } }
          ]
        },
        {
          "id": "sg-d1",
          "title": "Domain 1: Foundation Model Integration, Data Management & Compliance",
          "weight": 31,
          "tasks": [
            { "id": "t-d1-fm", "title": "Select and integrate foundation models (Amazon Bedrock)", "estHours": 8, "resourceUrl": "https://docs.aws.amazon.com/bedrock/", "progressByCheckpoint": { "cp1": 0 } },
            { "id": "t-d1-rag", "title": "Design RAG solutions with vector stores and knowledge bases", "estHours": 10, "resourceUrl": "https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html", "progressByCheckpoint": { "cp1": 0 } },
            { "id": "t-d1-data", "title": "Data management, ingestion and compliance for GenAI", "estHours": 6, "resourceUrl": "https://docs.aws.amazon.com/bedrock/", "progressByCheckpoint": { "cp1": 0 } }
          ]
        },
        {
          "id": "sg-d2",
          "title": "Domain 2: Implementation & Integration",
          "weight": 26,
          "tasks": [
            { "id": "t-d2-apps", "title": "Integrate FMs into applications and business workflows", "estHours": 8, "resourceUrl": "https://docs.aws.amazon.com/bedrock/", "progressByCheckpoint": { "cp1": 0 } },
            { "id": "t-d2-prompt", "title": "Prompt engineering and prompt management techniques", "estHours": 6, "resourceUrl": "https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-management.html", "progressByCheckpoint": { "cp1": 0 } },
            { "id": "t-d2-agents", "title": "Implement agentic AI solutions (Bedrock Agents)", "estHours": 8, "resourceUrl": "https://docs.aws.amazon.com/bedrock/latest/userguide/agents.html", "progressByCheckpoint": { "cp1": 0 } }
          ]
        },
        {
          "id": "sg-d3",
          "title": "Domain 3: AI Safety, Security & Governance",
          "weight": 20,
          "tasks": [
            { "id": "t-d3-guardrails", "title": "Apply Guardrails, Responsible AI and content filtering", "estHours": 6, "resourceUrl": "https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html", "progressByCheckpoint": { "cp1": 0 } },
            { "id": "t-d3-security", "title": "Security, IAM and governance for GenAI workloads", "estHours": 6, "resourceUrl": "https://docs.aws.amazon.com/bedrock/", "progressByCheckpoint": { "cp1": 0 } }
          ]
        },
        {
          "id": "sg-d4",
          "title": "Domain 4: Operational Efficiency & Optimization",
          "weight": 12,
          "tasks": [
            { "id": "t-d4-cost", "title": "Optimize GenAI apps for cost, performance and business value", "estHours": 5, "resourceUrl": "https://docs.aws.amazon.com/bedrock/", "progressByCheckpoint": { "cp1": 0 } }
          ]
        },
        {
          "id": "sg-d5",
          "title": "Domain 5: Testing, Validation & Troubleshooting",
          "weight": 11,
          "tasks": [
            { "id": "t-d5-eval", "title": "Evaluate FMs for quality and responsibility", "estHours": 4, "resourceUrl": "https://docs.aws.amazon.com/bedrock/latest/userguide/model-evaluation.html", "progressByCheckpoint": { "cp1": 0 } },
            { "id": "t-d5-monitor", "title": "Troubleshoot, monitor and observe GenAI applications", "estHours": 4, "resourceUrl": "https://docs.aws.amazon.com/bedrock/", "progressByCheckpoint": { "cp1": 0 } }
          ]
        }
      ]
    },
    {
      "id": "goal-pocs",
      "title": "POC Technical Demonstrations & Reusable Assets",
      "outcome": "POCs completed and demonstrated to the client during sales / delivery engagement; contribute to winning new opportunities and endorsement from the opportunity / engagement lead.",
      "dueDate": "2026-10-15",
      "weight": 1,
      "status": "not-started",
      "placeholder": true,
      "source": "PIP document",
      "notes": "Placeholder - source sub-tasks (which POCs, target clients, reusable assets) to fill in.",
      "subGoals": []
    },
    {
      "id": "goal-chargeable",
      "title": "Chargeable Utilization on Engagements",
      "outcome": "Perform chargeable work in delivery engagements and existing opportunities.",
      "dueDate": "2026-10-15",
      "weight": 1,
      "status": "not-started",
      "placeholder": true,
      "source": "PIP document",
      "notes": "Placeholder - source target engagements and utilization metrics to fill in.",
      "subGoals": []
    },
    {
      "id": "goal-ibm-badge",
      "title": "IBM Core Consulting Experienced Badge (Band 8)",
      "outcome": "Attain IBM Core Consulting Experienced Band 8 Practitioner badge.",
      "dueDate": "2026-10-15",
      "weight": 1,
      "status": "not-started",
      "placeholder": true,
      "source": "PIP document",
      "notes": "Placeholder - source the badge curriculum modules and assessment steps to fill in.",
      "subGoals": []
    },
    {
      "id": "goal-reskill",
      "title": "Reskilling: Forward Deployed Engineer - Cloud Solutions (Expert)",
      "outcome": "Complete the Forward Deployed Engineer - Cloud Solutions reskill learning plan at Expert level.",
      "dueDate": "2026-10-15",
      "weight": 1,
      "status": "not-started",
      "placeholder": true,
      "source": "PIP document",
      "notes": "Placeholder - source the reskilling learning-plan modules to fill in.",
      "subGoals": []
    }
  ]
}
;
