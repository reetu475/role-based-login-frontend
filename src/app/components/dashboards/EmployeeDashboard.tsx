import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { jobAPI, applicationAPI } from '../../../services/api';
import api from '../../../services/api';
import type { Job, Application } from '../../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Plus, Search, Eye, Edit, Trash2, Users, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isLoadingApplications, setIsLoadingApplications] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  
  // New job form state
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    jobType: 'Full-time',
    requiredSkills: '',
    educationRequired: '',
    experienceRequired: '',
    salary: '',
  });

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
      const data = await jobAPI.getJobsByEmployee(user.email);
      setJobs(data);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const loadApplications = async () => {
    if (!user?.email) return;
    
    setIsLoadingApplications(true);
    try {
      const data = await applicationAPI.getApplicationsByEmployee(user.email);
      setApplications(data);
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setIsLoadingApplications(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    setIsCreatingJob(true);

    try {
      const response = await api.post('/jobs', {
        ...newJob,
        postedBy: user.email,
        postedDate: new Date().toISOString(),
      });

      if (response.status === 200 || response.status === 201) {
        toast.success('Job posted successfully!');
        setNewJob({
          title: '',
          description: '',
          company: '',
          location: '',
          jobType: 'Full-time',
          requiredSkills: '',
          educationRequired: '',
          experienceRequired: '',
          salary: '',
        });
        loadJobs();
      } else {
        toast.error('Failed to post job');
      }
    } catch (error) {
      toast.error('Failed to post job');
    } finally {
      setIsCreatingJob(false);
    }
  };

  const handleUpdateApplicationStatus = async (applicationId: number, status: string) => {
    try {
      const response = await api.put(`/applications/${applicationId}/status`, { status });

      if (response.status === 200) {
        toast.success(`Application status updated to ${status}! Notification sent to student.`);
        loadApplications();
      } else {
        toast.error('Failed to update application status');
      }
    } catch (error) {
      toast.error('Failed to update application status');
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

  const filteredApplications = applications.filter(app =>
    app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total Jobs</CardTitle>
            <Plus className="size-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.length}</div>
            <p className="text-xs text-gray-500">Jobs posted by you</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total Applications</CardTitle>
            <Users className="size-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.length}</div>
            <p className="text-xs text-gray-500">Received applications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Pending Review</CardTitle>
            <Search className="size-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applications.filter(app => app.status === 'Applied').length}
            </div>
            <p className="text-xs text-gray-500">Awaiting your review</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">My Jobs</TabsTrigger>
          <TabsTrigger value="applications">Manage Applications</TabsTrigger>
          <TabsTrigger value="post-job">Post New Job</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Job Postings</CardTitle>
              <CardDescription>Job postings created by you that are pending manager approval</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingJobs ? (
                <div className="text-center py-8 text-gray-500">Loading jobs...</div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No jobs found. Post your first job!
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
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
                            <p className="text-sm text-gray-500">Posted on</p>
                            <p className="font-medium">{new Date(job.postedDate).toLocaleDateString()}</p>
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
                          <Button variant="outline">
                            <Edit className="size-4 mr-2" />
                            Edit
                          </Button>
                          <Button variant="outline" className="text-red-500">
                            <Trash2 className="size-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage Applications</CardTitle>
              <CardDescription>Review and manage job applications</CardDescription>
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
                        placeholder="Search by name or status..."
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
                                  onClick={() => handleUpdateApplicationStatus(app.id!, 'Hired')}
                                  disabled={app.status === 'Hired'}
                                >
                                  Hire
                                </Button>
                                {app.resumeUrl && (
                                  <Button variant="outline" size="sm">
                                    <Eye className="size-4 mr-2" />
                                    View Resume
                                  </Button>
                                )}
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

        <TabsContent value="post-job" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Post New Job Opening</CardTitle>
              <CardDescription>Create a new job posting for students to apply to</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateJob} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input
                      id="title"
                      placeholder="Software Developer"
                      value={newJob.title}
                      onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                      required
                      disabled={isCreatingJob}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      placeholder="Tech Corp"
                      value={newJob.company}
                      onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                      required
                      disabled={isCreatingJob}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="Bangalore, India"
                      value={newJob.location}
                      onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                      required
                      disabled={isCreatingJob}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jobType">Job Type</Label>
                    <Input
                      id="jobType"
                      placeholder="Full-time"
                      value={newJob.jobType}
                      onChange={(e) => setNewJob({ ...newJob, jobType: e.target.value })}
                      required
                      disabled={isCreatingJob}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Job Description</Label>
                  <Input
                    id="description"
                    placeholder="Describe the role and responsibilities..."
                    value={newJob.description}
                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                    required
                    disabled={isCreatingJob}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="requiredSkills">Required Skills</Label>
                    <Input
                      id="requiredSkills"
                      placeholder="Java, React, SQL"
                      value={newJob.requiredSkills}
                      onChange={(e) => setNewJob({ ...newJob, requiredSkills: e.target.value })}
                      required
                      disabled={isCreatingJob}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salary">Salary (Optional)</Label>
                    <Input
                      id="salary"
                      placeholder="500000"
                      value={newJob.salary}
                      onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                      disabled={isCreatingJob}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="educationRequired">Education Required</Label>
                    <Input
                      id="educationRequired"
                      placeholder="B.Tech Computer Science"
                      value={newJob.educationRequired}
                      onChange={(e) => setNewJob({ ...newJob, educationRequired: e.target.value })}
                      disabled={isCreatingJob}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experienceRequired">Experience Required</Label>
                    <Input
                      id="experienceRequired"
                      placeholder="2 years"
                      value={newJob.experienceRequired}
                      onChange={(e) => setNewJob({ ...newJob, experienceRequired: e.target.value })}
                      disabled={isCreatingJob}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isCreatingJob} className="w-full">
                  <Plus className="size-4 mr-2" />
                  {isCreatingJob ? 'Posting Job...' : 'Post Job'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};