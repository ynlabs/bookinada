# Week 1: project foundation and learning review

Status: the learner created the GitHub repository, committed the README baseline, and created `docs/week1-context`. The remaining documents were drafted/refined by the assistant, including a revision explicitly requested by the learner. They are proposals to review, not proof of learner understanding. Application implementation and independent peer review remain outstanding.

## Course scope

Exercise Sheet 0, pp. 13–15:

| Exercise | Project outcome |
| --- | --- |
| 7 | Repository, README, documentation directory, and an agreed contribution/review workflow. |
| 8 | A C4 System Context Diagram with system boundary, users, external systems, and labelled relationships. |
| 9 | 5–8 functional requirements, 2–3 quality requirements/concerns, identifiers, and review. |

No application functionality is required in Week 1. The original team/LRZ GitLab setup is adapted to a personal GitHub project; team participation and human peer review are separate unfinished activities.

## Read the deliverables in this order

1. `../README.md`: users, purpose, planned capabilities, and current status.
2. `system-context.md`: why the front end, booking services, synthetic inventory, and in-app notifications are internal. The separate local/test blockchain network is a proposed future dependency (A3), not a running Week 1 requirement. Open `system-context.svg` to see the diagram; edit `system-context.drawio` if its boundary changes.
3. `requirements.md`: eight FRs, three NFRs, correctness rules, proposed acceptance scenarios, assumptions, and open decisions.
4. `workflow.md`: inspect, stage, commit, push, open a PR, review, then merge.

## Theory connected to this work

| Concept | Application | English explanation to practise |
| --- | --- | --- |
| Information system | Bookinada processes business data and reservations. | Bookinada is primarily an information system because it manages travel data and business transactions. |
| Software artifact | Requirements, diagrams, code, and tests must evolve consistently. | A requirement change may affect interfaces, implementation, tests, and documentation. |
| System boundary | Ownership of responsibilities matters more than machine location. | The hotel service belongs inside Bookinada because it implements a responsibility owned by the platform. |
| FR and NFR | Booking is a capability; response time and usability constrain its quality. | A functional requirement specifies behavior, while a non-functional requirement constrains quality or operation. |
| Quality trade-off | More validation can improve correctness but adds work and may affect usability. | A design decision should explain which quality attributes it improves and what it costs. |
| Acceptance criterion | AC6 makes FR2's matching and availability rules observable. | Acceptance criteria define observable results used to check whether a requirement is satisfied. |
| Version control and review | Commits preserve history; a PR makes a change inspectable. | A commit records a local snapshot; a push publishes commits to the remote repository. |

## Worked hotel-search example

For a stay from 2026-11-07 to 2026-11-09, availability is needed on 7 and 8 November. Hotel A in Munich has a room type available on both nights, B is in Berlin, and C in Munich is unavailable for one night. AC6 expects only A, with no inventory reservation during search. AC7 distinguishes invalid dates from AC8's valid search with no matches. These detailed rules refine assumption A2; the course does not prescribe these exact dates or sample data.

The NFR1 usability target and NFR3 performance target are proposed benchmarks, not measurements. The search benchmark uses the 95th percentile, not the mean. A local database transaction does not automatically make a combined booking across independent services atomic.

## Completion and evidence

- [x] A GitHub repository and README baseline exist.
- [x] The learner created the Week 1 branch.
- [x] Assistant-assisted requirements and diagram documentation are prepared.
- [ ] The learner reviewed FR1–FR8, NFR1–NFR3, and A1–A7 and can explain them.
- [ ] The Week 1 changes are published in a GitHub PR and inspected.
- [ ] The PR is merged and local `main` is updated.
- [ ] Another student independently reviewed the work.

This checklist separates prepared documents from demonstrated learning. Mark publishing/merge items only after those operations actually succeed.

## After this baseline

Exercise Sheet 1 is available in the course workspace. It extends this work with a C4 Container Diagram, Flight and Hotel REST interfaces, OpenAPI 3.0.3 contracts, and automated validation. Do not claim those tasks are complete from the Week 1 context diagram. Review the theoretical exercises and quizzes separately for exam preparation; a working project or a completed document set cannot guarantee a grade.
