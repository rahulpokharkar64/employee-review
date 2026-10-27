import { useState } from "react";
import type { Employee, Review } from "../types";
import { EmptyState, Icon, PageHeading, StatusBadge } from "./shared";
import { avatarTone, initials } from "./utils";

export function EmployeesPage({
  employees,
  reviews,
}: {
  employees: Employee[];
  reviews: Review[];
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const filteredEmployees = employees.filter((employee) => {
    const text = [
      employee.name,
      employee.employee_id,
      employee.department ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return (
      text.includes(search.toLowerCase()) &&
      (!status || employee.status === status)
    );
  });

  return (
    <>
      <PageHeading
        eyebrow="PEOPLE DIRECTORY"
        title="Employees"
        description="Employee performance summaries from completed reviews."
      />
      <section className="panel directory-panel">
        <div className="directory-toolbar">
          <div>
            <h2>All employees</h2>
            <p>{filteredEmployees.length} employees</p>
          </div>
          <div className="directory-controls">
            <label className="search-input">
              <Icon name="search" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search employees"
                aria-label="Search employees"
              />
            </label>
            <select
              className="employee-status-filter"
              aria-label="Filter by status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">All statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
        {filteredEmployees.length ? (
          <div className="employee-grid">
            {filteredEmployees.map((employee) => {
              const employeeReviews = reviews.filter(
                (review) => review.employee_id === employee.id,
              );
              const average = employeeReviews.length
                ? employeeReviews.reduce(
                    (sum, review) => sum + review.average_rating,
                    0,
                  ) / employeeReviews.length
                : null;
              return (
                <article className="employee-card" key={employee.id}>
                  <div className="employee-card-top">
                    <div className={`avatar avatar-large ${avatarTone(employee.id)}`}>
                      {initials(employee.name)}
                    </div>
                    <StatusBadge status={employee.status} />
                  </div>
                  <h3>{employee.name}</h3>
                  <p className="employee-code">{employee.employee_id}</p>
                  <p className="employee-department">
                    {employee.department || "Department not assigned"}
                  </p>
                  {employee.email && (
                    <a
                      className="employee-email"
                      href={`mailto:${employee.email}`}
                    >
                      {employee.email}
                    </a>
                  )}
                  <div className="employee-card-stats">
                    <div>
                      <strong>{average === null ? "—" : average.toFixed(1)}</strong>
                      <span>Average rating</span>
                    </div>
                    <div>
                      <strong>{employeeReviews.length}</strong>
                      <span>Reviews</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No employees found"
            description="Try another employee name or status."
          />
        )}
      </section>
    </>
  );
}
