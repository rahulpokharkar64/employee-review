import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import {
  getEmployees,
  getReviewPeriods,
  getReviews,
} from "./api";
import { AppShell } from "./components/AppShell";
import { EmployeesPage } from "./components/EmployeesPage";
import { OverviewPage } from "./components/OverviewPage";
import {
  ReviewDetailsPage,
  ReviewListPage,
  SubmitReviewPage,
} from "./components/ReviewPages";
import { getErrorMessage } from "./components/utils";
import type { Employee, Review, ReviewPeriod } from "./types";

function App() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [periods, setPeriods] = useState<ReviewPeriod[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState("");
  const [apiConnected, setApiConnected] = useState(false);
  const [notice, setNotice] = useState("");

  const loadReferenceData = useCallback(async () => {
    setDataLoading(true);
    setDataError("");
    try {
      const [employeeData, periodData, reviewData] = await Promise.all([
        getEmployees(),
        getReviewPeriods(),
        getReviews(),
      ]);
      setEmployees(employeeData);
      setPeriods(periodData);
      setReviews(reviewData);
      setApiConnected(true);
    } catch (error) {
      setApiConnected(false);
      setDataError(getErrorMessage(error));
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReferenceData();
  }, [loadReferenceData]);

  const refreshReviews = useCallback(async (
    employeeCode?: string,
    periodId?: string,
  ) => {
    setDataError("");
    try {
      const result = await getReviews(employeeCode, periodId);
      setReviews(result);
      setApiConnected(true);
      return result;
    } catch (error) {
      setApiConnected(false);
      setDataError(getErrorMessage(error));
      return null;
    }
  }, []);

  const openPeriods = useMemo(
    () => periods.filter((period) => period.status === "Open"),
    [periods],
  );

  return (
    <div className="app-shell">
      <AppShell
        apiConnected={apiConnected}
        dataError={dataError}
        dataLoading={dataLoading}
        notice={notice}
        onDismissNotice={() => setNotice("")}
        onRetry={() => void loadReferenceData()}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route
            path="/overview"
            element={
              <OverviewPage
                employees={employees}
                periods={periods}
                reviews={reviews}
                loading={dataLoading}
                onOpenReview={(review) => navigate(`/reviews/${review.id}`)}
                onNavigate={navigate}
              />
            }
          />
          <Route
            path="/submit-review"
            element={
              <SubmitReviewPage
                employees={employees.filter(
                  (employee) => employee.status === "Active",
                )}
                periods={openPeriods}
                onCreated={async (review) => {
                  setNotice(
                    `Review submitted for ${review.employee_name} — ${review.period_name}.`,
                  );
                  await refreshReviews();
                  navigate("/reviews");
                }}
              />
            }
          />
          <Route
            path="/reviews"
            element={
              <ReviewListPage
                employees={employees}
                periods={periods}
                reviews={reviews}
                loading={dataLoading}
                onFilter={refreshReviews}
              />
            }
          />
          <Route
            path="/employees"
            element={<EmployeesPage employees={employees} reviews={reviews} />}
          />
          <Route path="/reviews/:reviewId" element={<ReviewDetailsPage />} />
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
      </AppShell>
    </div>
  );
}

export default App;
