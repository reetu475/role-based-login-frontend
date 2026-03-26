import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { jobAPI, applicationAPI, adminAPI } from '../../../services/api';
import type { Job, Application, User, HuggingFaceRankedApplication } from '../../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Users, Briefcase, CheckCircle, XCircle, Eye, Search, Mail, Phone, Plus, Calendar, Car, UserPlus, UserX, ShieldCheck, Clock } from 'lucide-react';
import { toast } from 'sonner';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isLoadingApplications, setIsLoadingApplications] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [rankedApplications, setRankedApplications] = useState<HuggingFaceRankedApplication[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [customKeywords, setCustomKeywords] = useState('');
  const [isRanking, setIsRanking] = useState(false);

  const handleGetTop3Candidates = async () => {
    if (!selectedJobId) {
      toast.error('Please select a job to analyze');
      return;
    }
    
    setIsRanking(true);
    try {
      console.log('=== RANKING DEBUG ===');
      console.log('Selected Job ID:', selectedJobId);
      console.log('Custom Keywords:', customKeywords);
      
      const rankedData = await adminAPI.getTop3Candidates(selectedJobId, customKeywords);
      console.log('Raw API Response:', rankedData);
      console.log('Response Type:', typeof rankedData);
      console.log('Response Length:', rankedData ? rankedData.length : 'undefined');
      
      if (rankedData && rankedData.length > 0) {
        console.log('First ranked application:', rankedData[0]);
        console.log('First application details:', rankedData[0]?.application);
        console.log('First application student name:', rankedData[0]?.application?.studentName);
        console.log('First application score:', rankedData[0]?.score);
        console.log('First application score percentage:', rankedData[0]?.scorePercentage);
      }
      
      setRankedApplications(rankedData);
      toast.success('Top 3 candidates ranked successfully!');
    } catch (error: any) {
      console.error('Error getting top 3 candidates:', error);
      console.error('Error details:', error.response || error.message || error);
      toast.error('Failed to rank candidates');
    } finally {
      setIsRanking(false);
    }
  };

  const handleViewAllRanked = async () => {
    if (!selectedJobId) {
      toast.error('Please select a job to analyze');
      return;
    }
    
    setIsRanking(true);
    try {
      const rankedData = await adminAPI.rankResumesTop(selectedJobId, customKeywords);
      setRankedApplications(rankedData);
      toast.success('All candidates ranked successfully!');
    } catch (error: any) {
      console.error('Error getting all ranked candidates:', error);
      toast.error('Failed to rank candidates');
    } finally {
      setIsRanking(false);
    }
  };

  const handleRankResumes = async () => {
    if (!selectedJobId) {
      toast.error('Please select a job to analyze');
      return;
    }
    
    setIsRanking(true);
    try {
      const rankedData = await adminAPI.rankResumes(selectedJobId, customKeywords);
      setRankedApplications(rankedData);
      toast.success('Resumes ranked successfully!');
    } catch (error: any) {
      console.error('Error ranking resumes:', error);
      toast.error('Failed to rank resumes');
    } finally {
      setIsRanking(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      loadJobs();
      loadApplications();
    }
  }, [user]);

  const loadJobs = async () => {
    if (!user?.email) return;
    
    setIsLoadingJobs(true);
    try {
      console.log('=== LOADING ALL JOBS FOR ADMIN ===');
      const data = await jobAPI.getAllJobsForAdmin();
      console.log('Jobs loaded from backend:', data);
      console.log('Total jobs:', data.length);
      console.log('Pending jobs:', data.filter(job => !job.approved).length);
      setJobs(data);
    } catch (error: any) {
      console.error('Error loading jobs:', error);
      toast.error('Failed to load jobs. Please check your connection and try again.');
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const createTestPendingJob = async () => {
    try {
      console.log('Creating test pending job...');
      const response = await jobAPI.createTestPendingJob();
      console.log('Test job created:', response);
      toast.success('Test pending job created successfully!');
      loadJobs();
    } catch (error: any) {
      console.error('Error creating test job:', error);
      toast.error('Failed to create test job');
    }
  };

  const loadApplications = async () => {
    if (!user?.email) return;
    
    setIsLoadingApplications(true);
    try {
      const data = await applicationAPI.getAllApplications();
      setApplications(data);
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setIsLoadingApplications(false);
    }
  };

  const handleApproveJob = async (jobId: number) => {
    try {
      console.log('=== APPROVAL TEST ===');
      console.log('Approving job:', jobId);
      console.log('API endpoint: Using jobAPI.approveJob');
      console.log('User email:', user?.email);
      console.log('User role:', user?.role);
      console.log('Frontend URL:', window.location.href);
      console.log('API Base URL:', 'https://rollbasedlogin-4.onrender.com/api');
      
      // Test the API call
      console.log('Making API call...');
      const response = await jobAPI.approveJob(jobId);
      console.log('Approval response:', response);
      console.log('Response type:', typeof response);
      console.log('Response has data:', !!response);
      
      if (response) {
        console.log('✅ SUCCESS: Job approved!');
        toast.success('Job approved successfully! Notification sent to employee.');
        loadJobs();
      } else {
        console.log('❌ FAILED: Job not found or already processed');
        toast.error('Job not found or already processed');
      }
    } catch (error: any) {
      console.error('❌ ERROR: Error approving job:', error);
      console.error('Error details:', error.response || error.message || error);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      console.error('Error stack:', error.stack);
      toast.error(`Failed to approve job: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    }
  };

  const handleRejectJob = async (jobId: number) => {
    try {
      console.log('Rejecting job:', jobId);
      console.log('API endpoint: Using jobAPI.rejectJob');
      
      const response = await jobAPI.rejectJob(jobId);
      console.log('Rejection response:', response);
      
      if (response) {
        toast.success('Job rejected successfully! Notification sent to employee.');
        loadJobs();
      } else {
        toast.error('Job not found or already processed');
      }
    } catch (error: any) {
      console.error('Error rejecting job:', error);
      console.error('Error details:', error.response || error.message || error);
      toast.error(`Failed to reject job: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    }
  };

  const handleUpdateApplicationStatus = async (applicationId: number, status: string) => {
    try {
      console.log(`Updating application ${applicationId} status to: ${status}`);
      const response = await applicationAPI.updateApplicationStatus(applicationId, status);
      console.log('Status update response:', response);
      
      if (response) {
        toast.success(`Application status updated to ${status}! Notification sent to student.`);
        loadApplications();
      } else {
        toast.error('Failed to update application status');
      }
    } catch (error: any) {
      console.error('Error updating application status:', error);
      console.error('Error details:', error.response || error.message || error);
      toast.error(`Failed to update status: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('hired')) {
      return <Badge className="bg-green-500">Hired</Badge>;
    }
    if (statusLower.includes('shortlisted')) {
      return <Badge className="bg-blue-500">Shortlisted</Badge>;
    }
    if (statusLower.includes('reviewed')) {
      return <Badge className="bg-yellow-500">Reviewed</Badge>;
    }
    if (statusLower.includes('rejected')) {
      return <Badge className="bg-red-500">Rejected</Badge>;
    }
    return <Badge>{status}</Badge>;
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.requiredSkills.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredApplications = applications.filter(app =>
    app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.jobId.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total Jobs</CardTitle>
            <Briefcase className="size-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.length}</div>
            <p className="text-xs text-gray-500">All job postings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Pending Jobs</CardTitle>
            <Clock className="size-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.filter(job => !job.approved).length}</div>
            <p className="text-xs text-gray-500">Need approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total Applications</CardTitle>
            <Users className="size-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.length}</div>
            <p className="text-xs text-gray-500">All applications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Hired Candidates</CardTitle>
            <CheckCircle className="size-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applications.filter(app => app.status === 'Hired').length}
            </div>
            <p className="text-xs text-gray-500">Successfully placed</p>
          </CardContent>
        </Card>
      </div>

      {/* Test Job Creation */}
      <div className="flex justify-center">
        <Button 
          onClick={createTestPendingJob}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Plus className="size-4 mr-2" />
          Create Test Pending Job
        </Button>
      </div>

      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">All Jobs</TabsTrigger>
          <TabsTrigger value="applications">All Applications</TabsTrigger>
          <TabsTrigger value="ai-ranking">AI Resume Ranking</TabsTrigger>
          <TabsTrigger value="accounts">Manage Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Job Postings</CardTitle>
              <CardDescription>View and manage all job postings across the portal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="search">Search Jobs</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
                      <Input
                        id="search"
                        placeholder="Search by title, company, location, or skills..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {isLoadingJobs ? (
                  <div className="text-center py-8 text-gray-500">Loading jobs...</div>
                ) : filteredJobs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No jobs found. Try adjusting your search criteria.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredJobs.map((job) => (
                      <Card key={job.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold">{job.title}</h3>
                              <p className="text-gray-600">{job.company}</p>
                              <div className="flex gap-2 mt-2">
                                <Badge>{job.jobType}</Badge>
                                <Badge variant="secondary">{job.location}</Badge>
                                {!job.approved && <Badge variant="outline">Pending Approval</Badge>}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Posted by</p>
                              <p className="font-medium">{job.postedBy}</p>
                              {job.salary && (
                                <p className="text-sm font-semibold text-green-600 mt-1">₹{job.salary}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-500">Required Skills</p>
                              <p className="font-medium">{job.requiredSkills}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Experience Required</p>
                              <p className="font-medium">{job.experienceRequired || 'Not specified'}</p>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 mb-4">{job.description}</p>

                          <div className="flex gap-2">
                            {!job.approved && (
                              <>
                                <Button
                                  onClick={() => handleApproveJob(job.id!)}
                                  className="bg-green-500 hover:bg-green-600"
                                >
                                  <CheckCircle className="size-4 mr-2" />
                                  Approve
                                </Button>
                                <Button
                                  onClick={() => handleRejectJob(job.id!)}
                                  variant="outline"
                                  className="text-red-500 border-red-500 hover:bg-red-50"
                                >
                                  <XCircle className="size-4 mr-2" />
                                  Reject
                                </Button>
                              </>
                            )}
                            <Button variant="outline">
                              <Eye className="size-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                          
                          {/* Debug info - will be hidden in production */}
                          <div className="mt-2 text-xs text-gray-400">
                            Debug: Job ID {job.id} - Approved: {job.approved ? 'Yes' : 'No'} - Posted by: {job.postedBy}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Job Applications</CardTitle>
              <CardDescription>Monitor and track all job applications across the portal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="search">Search Applications</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
                      <Input
                        id="search"
                        placeholder="Search by name, status, or job ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {isLoadingApplications ? (
                  <div className="text-center py-8 text-gray-500">Loading applications...</div>
                ) : filteredApplications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No applications found.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student Name</TableHead>
                          <TableHead>Job ID</TableHead>
                          <TableHead>Applied Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredApplications.map((app) => (
                          <TableRow key={app.id}>
                            <TableCell>{app.studentName}</TableCell>
                            <TableCell>{app.jobId}</TableCell>
                            <TableCell>{new Date(app.appliedDate).toLocaleDateString()}</TableCell>
                            <TableCell>{getStatusBadge(app.status)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {app.resumeUrl && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => window.open(app.resumeUrl, '_blank')}
                                  >
                                    <Eye className="size-4 mr-2" />
                                    View Resume
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateApplicationStatus(app.id!, 'Reviewed')}
                                  disabled={app.status === 'Reviewed'}
                                >
                                  Review
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateApplicationStatus(app.id!, 'Shortlisted')}
                                  disabled={app.status === 'Shortlisted'}
                                >
                                  Shortlist
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateApplicationStatus(app.id!, 'Rejected')}
                                  disabled={app.status === 'Rejected'}
                                >
                                  Reject
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-green-500 hover:bg-green-600 text-white"
                                  onClick={() => handleUpdateApplicationStatus(app.id!, 'Hired')}
                                  disabled={app.status === 'Hired'}
                                >
                                  Hire
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-ranking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Resume Ranking</CardTitle>
              <CardDescription>Use Hugging Face AI to analyze and rank job applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="job-select">Select Job to Analyze</Label>
                    <select
                      id="job-select"
                      value={selectedJobId || ''}
                      onChange={(e) => setSelectedJobId(e.target.value ? Number(e.target.value) : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select a job...</option>
                      {jobs.map((job) => (
                        <option key={job.id} value={job.id}>
                          {job.title} - {job.company}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="keywords">Custom Keywords (optional)</Label>
                    <Input
                      id="keywords"
                      value={customKeywords}
                      onChange={(e) => setCustomKeywords(e.target.value)}
                      placeholder="e.g., Java, React, AWS, Python"
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={handleGetTop3Candidates}
                    disabled={!selectedJobId || isRanking}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isRanking ? 'Analyzing...' : 'Get Top 3 Candidates'}
                  </Button>
                  <Button 
                    onClick={handleViewAllRanked}
                    disabled={!selectedJobId || isRanking}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isRanking ? 'Analyzing...' : 'View All Ranked'}
                  </Button>
                  <Button 
                    onClick={handleRankResumes}
                    disabled={!selectedJobId || isRanking}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isRanking ? 'Analyzing...' : 'Rank Resumes'}
                  </Button>
                </div>

                <div className="mt-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">
                    Ranked Candidates (using Hugging Face AI)
                  </h4>
                  {rankedApplications && rankedApplications.length > 0 ? (
                    <div className="space-y-3">
                      {rankedApplications.map((rankedApp, index) => (
                        <div key={rankedApp.application.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-semibold text-gray-900">
                                  {index + 1}. {rankedApp.application.studentName}
                                </span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                  Score: {rankedApp.scorePercentage}
                                </span>
                              </div>
                              <div className="mt-1 text-sm text-gray-600">
                                Applied for: {jobs.find(j => j.id === rankedApp.application.jobId)?.title || 'Unknown Job'}
                              </div>
                              <div className="mt-2 grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                                <div>
                                  <span className="font-medium">CGPA:</span> {rankedApp.cgpa}
                                </div>
                                <div>
                                  <span className="font-medium">Skills:</span> {rankedApp.skills}
                                </div>
                                <div>
                                  <span className="font-medium">Education:</span> {rankedApp.education}
                                </div>
                                <div>
                                  <span className="font-medium">Applied:</span> {new Date(rankedApp.application.appliedDate).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No ranked candidates yet. Select a job and click "Get Top 3 Candidates" or "View All Ranked" to analyze applications.
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage User Accounts</CardTitle>
              <CardDescription>View, manage, and monitor all user accounts in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="search">Search Users</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
                      <Input
                        id="search"
                        placeholder="Search by name, email, or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="size-4" />
                        Students
                      </CardTitle>
                      <CardDescription>Student accounts</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">0</div>
                      <p className="text-xs text-gray-500">Total students</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="size-4" />
                        Employees
                      </CardTitle>
                      <CardDescription>Employee accounts</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">0</div>
                      <p className="text-xs text-gray-500">Total employees</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="size-4" />
                        Admins
                      </CardTitle>
                      <CardDescription>Administrator accounts</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">0</div>
                      <p className="text-xs text-gray-500">Total admins</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          Account management functionality coming soon
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
