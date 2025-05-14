import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AccordionModule } from 'primeng/accordion';

@Component({
  selector: 'app-tips-and-tricks',
  imports: [RouterModule, AccordionModule],
  templateUrl: './tips-and-tricks.component.html',
  styles: ``,
})
export class TipsAndTricksComponent {
  interviewQuestions: {
    title: string;
    subtitle: string;
    description: string;
    tags: string[];
  }[] = [
    {
      title: 'Tell me about yourself',
      subtitle: 'The classic opener in almost every interview',
      description:
        "Structure your answer with: a brief introduction about your professional background, your relevant experience, and why you're interested in this role or company. Keep it concise (60-90 seconds) and practice until it feels natural.",
      tags: ['Behavioral', 'Introduction'],
    },
    {
      title: 'What are your strengths and weaknesses?',
      subtitle: 'A question designed to test your self-awareness',
      description:
        'For strengths, choose qualities relevant to the job. For weaknesses, be honest but strategic—mention a real weakness, but focus on how you\'re actively working to improve it. Avoid clichés like "I\'m a perfectionist."',
      tags: ['Behavioral', 'Self-assessment'],
    },
    {
      title: 'Why do you want to work here?',
      subtitle: "Your chance to show you've done your research",
      description:
        "Research the company thoroughly before your interview. Mention specific aspects of the company's mission, culture, products, or recent achievements that resonate with you. Connect these to your career goals and values.",
      tags: ['Motivational', 'Company fit'],
    },
    {
      title: 'Describe a challenging situation and how you handled it',
      subtitle: 'Testing your problem-solving and resilience',
      description:
        'Use the STAR method (Situation, Task, Action, Result) to structure your answer. Choose a relevant professional challenge, explain your approach, and highlight the positive outcome and what you learned from the experience.',
      tags: ['Behavioral', 'Problem-solving'],
    },
  ];

  
}
